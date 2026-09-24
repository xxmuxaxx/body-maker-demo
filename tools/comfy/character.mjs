#!/usr/bin/env node
// Builds the layered raster character with ComfyUI.
//
//   yarn gen:character base [--force]                 stylize the SVG body (Krea img2img) and split it into layers
//   yarn gen:character items [--id=a,b] [--seeds=1,2,3] [--force]
//                                                     Klein-edit the base once per seed and write a review sheet
//   yarn gen:character pick <id>=<seed> ...           cut the chosen variant into src/assets/character/<id>.webp
//
// Needs COMFY_URL (and COMFY_AUTH=user:pass) for base/items. Raw variants go to
// tools/comfy/character/variants/ (not committed).
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { createClient } from "./client.mjs";
import { H, W, extractLayer, slotArea, splitBase, toWebp } from "./layers.mjs";
import { fillWorkflow } from "./workflow.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const workDir = path.join(here, "character");
const variantsDir = path.join(workDir, "variants");
const outDir = path.join(root, "src/assets/character");
const manifestPath = path.join(outDir, "manifest.json");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const config = await readJson(path.join(here, "character.json"));

const layerDefs = async () => {
  const items = await readJson(path.join(root, "src/data/items.json"));
  const subjects = (await readJson(path.join(here, "subjects.json"))).items;
  const defs = Object.fromEntries(items.map((item) => [item.id, { slot: item.slot, subject: subjects[item.id] }]));
  return { ...defs, ...config.extra };
};

const promptFor = ({ slot, subject }) =>
  config.prompts[slot].replace("{subject}", subject).replace("{keep}", config.keep);

const client = () => {
  if (!process.env.COMFY_URL) throw new Error("Set COMFY_URL (and COMFY_AUTH=user:pass)");
  return createClient({ url: process.env.COMFY_URL, auth: process.env.COMFY_AUTH });
};

const updateManifest = async (patch) => {
  const manifest = existsSync(manifestPath) ? await readJson(manifestPath) : { layers: {} };
  Object.assign(manifest, patch.top ?? {});
  Object.assign(manifest.layers, patch.layers ?? {});
  manifest.layers = Object.fromEntries(Object.entries(manifest.layers).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
};

const krea = (image) => ({
  1: { class_type: "UNETLoader", inputs: { unet_name: "krea2_turbo_fp8_scaled.safetensors", weight_dtype: "default" } },
  2: { class_type: "CLIPLoader", inputs: { clip_name: "qwen3vl_4b_fp8_uncensored.safetensors", type: "krea2", device: "default" } },
  3: { class_type: "VAELoader", inputs: { vae_name: "qwen_image_vae.safetensors" } },
  4: { class_type: "CLIPTextEncode", inputs: { text: config.base.prompt, clip: ["2", 0] } },
  5: { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
  6: { class_type: "LoadImage", inputs: { image } },
  7: { class_type: "VAEEncode", inputs: { pixels: ["6", 0], vae: ["3", 0] } },
  8: { class_type: "KSampler", inputs: { model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["7", 0], seed: config.base.seed, steps: 8, cfg: 1, sampler_name: "euler", scheduler: "simple", denoise: config.base.denoise } },
  9: { class_type: "VAEDecode", inputs: { samples: ["8", 0], vae: ["3", 0] } },
  10: { class_type: "SaveImage", inputs: { images: ["9", 0], filename_prefix: "body-maker/character/base" } },
});

const commands = {
  async base(args) {
    const basePath = path.join(workDir, "base.png");
    if (!existsSync(basePath) || args.force) {
      const comfy = client();
      const image = await comfy.upload(await readFile(path.join(workDir, "base-input.png")), "character-base-input.png");
      await writeFile(basePath, await comfy.run(krea(image)));
      console.log("+ generated tools/comfy/character/base.png");
    }
    const { skin, underwear, skinLum } = await splitBase(await readFile(basePath));
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "base.webp"), await toWebp(skin));
    await writeFile(path.join(outDir, "underwear.webp"), await toWebp(underwear));
    await updateManifest({ top: { skinLum, canvas: { width: W, height: H } } });
    console.log(`+ base.webp, underwear.webp (reference skin luminance ${skinLum})`);
  },

  async items(args) {
    const comfy = client();
    const defs = await layerDefs();
    const template = await readJson(path.join(here, "workflows/klein-edit.json"));
    const seeds = (args.seeds ?? "1,2,3").split(",").map(Number);
    const ids = args.id ? args.id.split(",") : Object.keys(defs);
    const basePng = await readFile(path.join(workDir, "base.png"));
    const image = await comfy.upload(basePng, "character-base.png");
    await mkdir(variantsDir, { recursive: true });

    for (const id of ids) {
      if (!defs[id]) throw new Error(`Unknown layer id ${id}`);
      for (const seed of seeds) {
        const file = path.join(variantsDir, `${id}-${seed}.png`);
        if (existsSync(file) && !args.force) continue;
        const started = Date.now();
        const png = await comfy.run(fillWorkflow(template, {
          image, positive: promptFor(defs[id]), seed, width: W, height: H, prefix: `body-maker/character/${id}`,
        }));
        await writeFile(file, png);
        console.log(`+ ${id} seed ${seed} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
      }
    }
    await writeSheet(ids, seeds, defs, basePng);
  },

  async pick(args) {
    const defs = await layerDefs();
    const basePng = await readFile(path.join(workDir, "base.png"));
    const layers = {};
    for (const choice of args._) {
      const [id, seed] = choice.split("=");
      if (!defs[id]) throw new Error(`Unknown layer id ${id}`);
      const layer = await cutLayer(id, defs[id].slot, await readFile(path.join(variantsDir, `${id}-${seed}.png`)), basePng);
      await writeFile(path.join(outDir, `${id}.webp`), await toWebp(layer));
      layers[id] = { slot: defs[id].slot, seed: Number(seed), refLum: await brightLuminance(layer) };
      console.log(`+ src/assets/character/${id}.webp (seed ${seed})`);
    }
    await updateManifest({ layers });
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

const cutLayer = async (id, slot, editPng, basePng) =>
  extractLayer(editPng, basePng, await slotArea(slot), { cutBelowY: slot === "shirt" ? 230 : null });

// Crops of each variant's layer over the base, one row per id, for picking the best seed.
const SLOT_CROP = { shirt: [0, 170, 640, 560], shorts: [60, 600, 520, 330], boots: [40, 1300, 560, 236], gloves: [0, 750, 640, 260] };
const writeSheet = async (ids, seeds, defs, basePng) => {
  const cell = 220;
  const rows = [];
  for (const id of ids) {
    const [left, top, width, height] = SLOT_CROP[defs[id].slot];
    const cells = [];
    for (const seed of seeds) {
      const file = path.join(variantsDir, `${id}-${seed}.png`);
      if (!existsSync(file)) continue;
      const layer = await cutLayer(id, defs[id].slot, await readFile(file), basePng);
      const frame = await sharp({ create: { width: W, height: H, channels: 3, background: "#2a6e3f" } })
        .composite([{ input: await sharp(basePng).resize(W, H).png().toBuffer(), blend: "multiply" }, { input: layer }])
        .png().toBuffer();
      cells.push(await sharp(frame).extract({ left, top, width, height }).resize(cell, cell, { fit: "contain", background: "#2a6e3f" }).png().toBuffer());
    }
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="${cell}"><text x="8" y="${cell / 2}" font-family="sans-serif" font-size="16" fill="#fff">${id}</text></svg>`);
    rows.push({ label, cells });
  }
  const sheet = sharp({ create: { width: 200 + seeds.length * (cell + 6), height: rows.length * (cell + 6), channels: 3, background: "#222" } });
  const parts = rows.flatMap((row, r) => [
    { input: row.label, left: 0, top: r * (cell + 6) },
    ...row.cells.map((input, c) => ({ input, left: 200 + c * (cell + 6), top: r * (cell + 6) })),
  ]);
  const file = path.join(variantsDir, "sheet.png");
  await sheet.composite(parts).png().toFile(file);
  console.log(`Review sheet: ${path.relative(root, file)} (columns = seeds ${seeds.join(", ")})`);
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
  console.error("Usage: yarn gen:character base|items|pick (see tools/comfy/character.mjs)");
  process.exit(1);
}
commands[command](parseArgs(rest)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
