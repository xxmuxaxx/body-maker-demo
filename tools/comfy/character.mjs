#!/usr/bin/env node
// Builds the layered raster character with ComfyUI. One base per sex and body type
// ("man-1" ... "woman-3", see character.json), each with its own clothing layers.
//
//   yarn gen:character bases [--id=man-2,woman-1] [--seeds=1,2,3] [--force]
//        man-1: Krea img2img of the rendered SVG body; others: Klein edit of their "from" base.
//        Writes variants and a review sheet.
//   yarn gen:character pick-base <key>=<seed> ...     make a variant the base and split it into layers
//   yarn gen:character items --base=<key|all> [--id=a,b] [--seeds=1,2] [--force]
//   yarn gen:character pick --base=<key> <id>=<seed> ...  (or --all=<seed> for every layer)
//
// Needs COMFY_URL (and COMFY_AUTH=user:pass) for generation. Raw variants go to
// tools/comfy/character/variants/ (not committed); chosen bases to tools/comfy/character/bases/.
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { createClient } from "./client.mjs";
import { H, W, extractLayer, slotArea, splitBase, toWebp } from "./layers.mjs";
import { fillWorkflow } from "./workflow.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const workDir = path.join(here, "character");
const basesDir = path.join(workDir, "bases");
const variantsDir = path.join(workDir, "variants");
const outDir = path.join(root, "src/assets/character");
const manifestPath = path.join(outDir, "manifest.json");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const config = await readJson(path.join(here, "character.json"));
const baseKeys = Object.keys(config.bases);

const layerDefs = async () => {
  const items = await readJson(path.join(root, "src/data/items.json"));
  const subjects = (await readJson(path.join(here, "subjects.json"))).items;
  const defs = Object.fromEntries(items.map((item) => [item.id, { slot: item.slot, subject: subjects[item.id] }]));
  return { ...defs, ...config.extra };
};

const promptFor = ({ slot, subject }, sex) => {
  const words = { ...config.sexes[sex], subject, keep: config.keep };
  return config.prompts[slot].replace(/\{(\w+)\}/g, (_, key) => words[key] ?? "").replace(/\s+/g, " ").trim();
};

const client = () => {
  if (!process.env.COMFY_URL) throw new Error("Set COMFY_URL (and COMFY_AUTH=user:pass)");
  return createClient({ url: process.env.COMFY_URL, auth: process.env.COMFY_AUTH });
};

const readManifest = async () => (existsSync(manifestPath) ? readJson(manifestPath) : { canvas: { width: W, height: H }, bases: {} });
const writeManifest = async (manifest) => {
  manifest.bases = Object.fromEntries(Object.entries(manifest.bases).sort(([a], [b]) => a.localeCompare(b)));
  for (const base of Object.values(manifest.bases)) {
    base.layers = Object.fromEntries(Object.entries(base.layers ?? {}).sort(([a], [b]) => a.localeCompare(b)));
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
};

const krea = (image, { prompt, seed, denoise }) => ({
  1: { class_type: "UNETLoader", inputs: { unet_name: "krea2_turbo_fp8_scaled.safetensors", weight_dtype: "default" } },
  2: { class_type: "CLIPLoader", inputs: { clip_name: "qwen3vl_4b_fp8_uncensored.safetensors", type: "krea2", device: "default" } },
  3: { class_type: "VAELoader", inputs: { vae_name: "qwen_image_vae.safetensors" } },
  4: { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["2", 0] } },
  5: { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
  6: { class_type: "LoadImage", inputs: { image } },
  7: { class_type: "VAEEncode", inputs: { pixels: ["6", 0], vae: ["3", 0] } },
  8: { class_type: "KSampler", inputs: { model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["7", 0], seed, steps: 8, cfg: 1, sampler_name: "euler", scheduler: "simple", denoise } },
  9: { class_type: "VAEDecode", inputs: { samples: ["8", 0], vae: ["3", 0] } },
  10: { class_type: "SaveImage", inputs: { images: ["9", 0], filename_prefix: "body-maker/character/base" } },
});

const kleinEdit = async (comfy, imageName, prompt, seed, prefix) => {
  const template = await readJson(path.join(here, "workflows/klein-edit.json"));
  return comfy.run(fillWorkflow(template, { image: imageName, positive: prompt, seed, width: W, height: H, prefix }));
};

const listFrom = (value, all) => (value && value !== "all" ? value.split(",") : all);
const seedsFrom = (value, fallback) => (value ?? fallback).split(",").map(Number);

const commands = {
  async bases(args) {
    const comfy = client();
    const seeds = seedsFrom(args.seeds, "1,2,3");
    const keys = listFrom(args.id, baseKeys);
    const dir = path.join(variantsDir, "bases");
    await mkdir(dir, { recursive: true });
    const files = [];
    for (const key of keys) {
      const def = config.bases[key];
      if (!def) throw new Error(`Unknown base ${key}`);
      const source = def.krea ? path.join(workDir, "base-input.png") : path.join(basesDir, `${def.from}.png`);
      if (!existsSync(source)) throw new Error(`${key} needs ${path.relative(root, source)}: pick base "${def.from}" first`);
      const image = await comfy.upload(await readFile(source), `character-${def.krea ? "input" : def.from}.png`);
      for (const seed of def.krea ? [def.krea.seed] : seeds) {
        const file = path.join(dir, `${key}-${seed}.png`);
        files.push({ label: `${key} #${seed}`, file });
        if (existsSync(file) && !args.force) continue;
        const started = Date.now();
        const png = def.krea
          ? await comfy.run(krea(image, def.krea))
          : await kleinEdit(comfy, image, def.prompt, seed, `body-maker/character/base-${key}`);
        await writeFile(file, png);
        console.log(`+ base ${key} seed ${seed} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
      }
    }
    await writeGrid(files, path.join(dir, "sheet.png"), [0, 0, W, H], 5);
  },

  async "pick-base"(args) {
    const manifest = await readManifest();
    await mkdir(basesDir, { recursive: true });
    for (const choice of args._) {
      const [key, seed] = choice.split("=");
      if (!config.bases[key]) throw new Error(`Unknown base ${key}`);
      const source = path.join(variantsDir, "bases", `${key}-${seed}.png`);
      if (existsSync(source)) await copyFile(source, path.join(basesDir, `${key}.png`));
      const { skin, underwear, underwearTop, skinLum } = await splitBase(await readFile(path.join(basesDir, `${key}.png`)));
      const dir = path.join(outDir, key);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "base.webp"), await toWebp(skin));
      await writeFile(path.join(dir, "underwear.webp"), await toWebp(underwear));
      if (underwearTop) await writeFile(path.join(dir, "underwear-top.webp"), await toWebp(underwearTop));
      manifest.bases[key] = { ...(manifest.bases[key] ?? { layers: {} }), skinLum, underwearTop: Boolean(underwearTop) };
      console.log(`+ ${key}: base.webp, underwear${underwearTop ? " + top" : ""} (skin luminance ${skinLum})`);
    }
    await writeManifest(manifest);
  },

  async items(args) {
    const comfy = client();
    const defs = await layerDefs();
    const seeds = seedsFrom(args.seeds, "1");
    const ids = listFrom(args.id, Object.keys(defs));
    const keys = listFrom(args.base, baseKeys).filter((key) => existsSync(path.join(basesDir, `${key}.png`)));
    const bases = {};
    for (const key of keys) {
      const png = await readFile(path.join(basesDir, `${key}.png`));
      bases[key] = { png, image: await comfy.upload(png, `character-${key}.png`) };
      await mkdir(path.join(variantsDir, key), { recursive: true });
    }
    // Item first, then bases grouped by sex: bases of one sex share the prompt, and ComfyUI
    // reuses the encoded prompt instead of reloading the text encoder for every run.
    const ordered = [...keys].sort((a, b) => config.bases[a].sex.localeCompare(config.bases[b].sex));
    for (const id of ids) {
      if (!defs[id]) throw new Error(`Unknown layer id ${id}`);
      for (const key of ordered) {
        for (const seed of seeds) {
          const file = path.join(variantsDir, key, `${id}-${seed}.png`);
          if (existsSync(file) && !args.force) continue;
          const started = Date.now();
          await writeFile(file, await kleinEdit(comfy, bases[key].image, promptFor(defs[id], config.bases[key].sex), seed, `body-maker/character/${key}/${id}`));
          console.log(`+ ${key}/${id} seed ${seed} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
        }
      }
    }
    for (const key of keys) await writeItemSheet(key, ids, seeds, defs, bases[key].png);
  },

  async pick(args) {
    const defs = await layerDefs();
    const manifest = await readManifest();
    for (const key of listFrom(args.base, baseKeys)) {
      if (!manifest.bases[key]) {
        console.warn(`! ${key}: no base yet, skipped`);
        continue;
      }
      const basePng = await readFile(path.join(basesDir, `${key}.png`));
      const choices = args.all
        ? (await readdir(path.join(variantsDir, key))).filter((f) => f.endsWith(`-${args.all}.png`)).map((f) => `${f.slice(0, -`-${args.all}.png`.length)}=${args.all}`)
        : args._;
      for (const choice of choices) {
        const [id, seed] = choice.split("=");
        if (!defs[id]) throw new Error(`Unknown layer id ${id}`);
        const layer = await cutLayer(defs[id].slot, await readFile(path.join(variantsDir, key, `${id}-${seed}.png`)), basePng);
        await writeFile(path.join(outDir, key, `${id}.webp`), await toWebp(layer));
        manifest.bases[key].layers[id] = { slot: defs[id].slot, seed: Number(seed), refLum: await brightLuminance(layer) };
      }
      console.log(`+ ${key}: ${choices.length} layer(s)`);
    }
    await writeManifest(manifest);
  },
};

// 90th percentile luminance of the opaque pixels: the "white" a tinted layer maps to its color.
const brightLuminance = async (png) => {
  const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const values = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 200) values.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  values.sort((a, b) => a - b);
  return Math.round(values[Math.floor(values.length * 0.9)] ?? 235);
};

const cutLayer = async (slot, editPng, basePng) =>
  extractLayer(editPng, basePng, await slotArea(slot), { cutBelowY: slot === "shirt" ? 230 : null });

// Review grids: files = [{ label, file | buffer }], each cropped to `crop` and fit into a cell.
const writeGrid = async (cells, file, [left, top, width, height], columns, cell = 220) => {
  const rows = Math.ceil(cells.length / columns);
  const labelHeight = 22;
  const parts = [];
  for (const [index, entry] of cells.entries()) {
    const x = (index % columns) * (cell + 6);
    const y = Math.floor(index / columns) * (cell + labelHeight + 6);
    const image = entry.buffer ?? (existsSync(entry.file) ? await readFile(entry.file) : null);
    if (!image) continue;
    const full = await sharp(image).resize(W, H).png().toBuffer();
    parts.push({ input: await sharp(await sharp(full).extract({ left, top, width, height }).toBuffer()).resize(cell, cell, { fit: "contain", background: "#2a6e3f" }).png().toBuffer(), left: x, top: y + labelHeight });
    parts.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="${labelHeight}"><text x="4" y="16" font-family="sans-serif" font-size="14" fill="#fff">${entry.label}</text></svg>`), left: x, top: y });
  }
  await sharp({ create: { width: columns * (cell + 6), height: rows * (cell + labelHeight + 6), channels: 3, background: "#222" } })
    .composite(parts).png().toFile(file);
  console.log(`Review sheet: ${path.relative(root, file)}`);
};

const SLOT_CROP = { shirt: [0, 170, 640, 560], shorts: [40, 600, 560, 330], boots: [20, 1290, 600, 246], gloves: [0, 740, 640, 280] };
const writeItemSheet = async (key, ids, seeds, defs, basePng) => {
  const bySlot = {};
  for (const id of ids) {
    for (const seed of seeds) {
      const file = path.join(variantsDir, key, `${id}-${seed}.png`);
      if (!existsSync(file)) continue;
      const layer = await cutLayer(defs[id].slot, await readFile(file), basePng);
      const frame = await sharp({ create: { width: W, height: H, channels: 3, background: "#2a6e3f" } })
        .composite([{ input: await sharp(basePng).resize(W, H).png().toBuffer(), blend: "multiply" }, { input: layer }]).png().toBuffer();
      (bySlot[defs[id].slot] ??= []).push({ label: `${id} #${seed}`, buffer: frame });
    }
  }
  for (const [slot, cells] of Object.entries(bySlot)) {
    await writeGrid(cells, path.join(variantsDir, key, `sheet-${slot}.png`), SLOT_CROP[slot], 6);
  }
};

const parseArgs = (argv) => {
  const args = { _: [] };
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value ?? true;
    } else {
      args._.push(arg);
    }
  }
  return args;
};

const [command, ...rest] = process.argv.slice(2);
if (!commands[command]) {
  console.error("Usage: yarn gen:character bases|pick-base|items|pick (see tools/comfy/character.mjs)");
  process.exit(1);
}
commands[command](parseArgs(rest)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
