#!/usr/bin/env node
// Generates game art with ComfyUI from the catalogs in src/data.
//
//   COMFY_URL=https://... COMFY_AUTH=user:pass yarn gen:art [options]
//
//   --check            print GPU info and available checkpoints, then exit
//   --only=items,...   kinds to generate: items, boosters, opponents (default: all)
//   --id=a,b           only these catalog ids
//   --force            regenerate even if the file already exists
//   --reroll=N         change seeds (N is mixed into each id's seed) to get new variants
//   --dry-run          print prompts without calling ComfyUI
//
// Optional env: COMFY_CHECKPOINT, COMFY_WORKFLOW (API-format JSON with {{placeholders}}),
// COMFY_STEPS (28), COMFY_CFG (6.5).
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "./client.mjs";
import { finalize, removeBackground } from "./postprocess.mjs";
import { fillWorkflow, seedFromId } from "./workflow.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const KINDS = ["items", "boosters", "opponents"];

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

const parseArgs = (argv) => {
  const args = { only: KINDS, ids: null, force: false, reroll: 0, dryRun: false, check: false };
  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key === "only") args.only = value.split(",");
    else if (key === "id") args.ids = new Set(value.split(","));
    else if (key === "force") args.force = true;
    else if (key === "reroll") args.reroll = Number(value) || 1;
    else if (key === "dry-run") args.dryRun = true;
    else if (key === "check") args.check = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  const unknown = args.only.filter((kind) => !KINDS.includes(kind));
  if (unknown.length) throw new Error(`Unknown kind: ${unknown.join(", ")}`);
  return args;
};

const looksLikeLargeModel = (name) => /xl|flux|sd3|pony|illustrious/i.test(name);

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const { COMFY_URL, COMFY_AUTH, COMFY_CHECKPOINT, COMFY_WORKFLOW } = process.env;
  const steps = Number(process.env.COMFY_STEPS ?? 28);
  const cfg = Number(process.env.COMFY_CFG ?? 6.5);

  if (!COMFY_URL && !args.dryRun) throw new Error("Set COMFY_URL (and COMFY_AUTH=user:pass if the tunnel has basic auth)");
  const client = COMFY_URL ? createClient({ url: COMFY_URL, auth: COMFY_AUTH }) : null;

  if (args.check) {
    const stats = await client.systemStats();
    console.log("ComfyUI", stats.system?.comfyui_version ?? "", "| devices:",
      (stats.devices ?? []).map((d) => `${d.name} (${Math.round((d.vram_total ?? 0) / 2 ** 30)} GB)`).join(", "));
    console.log("Checkpoints:\n  " + (await client.checkpoints()).join("\n  "));
    return;
  }

  let checkpoint = COMFY_CHECKPOINT ?? "<checkpoint>";
  if (client && !COMFY_CHECKPOINT) {
    const list = await client.checkpoints();
    if (!list.length) throw new Error("ComfyUI has no checkpoints; set COMFY_CHECKPOINT or install one");
    checkpoint = list.find(looksLikeLargeModel) ?? list[0];
  }
  console.log(`Checkpoint: ${checkpoint}`);

  const template = await readJson(COMFY_WORKFLOW ? path.resolve(COMFY_WORKFLOW) : path.join(here, "workflows/txt2img.json"));
  const style = await readJson(path.join(here, "style.json"));
  const subjects = await readJson(path.join(here, "subjects.json"));

  let done = 0;
  let failed = 0;
  for (const kind of args.only) {
    const catalog = await readJson(path.join(root, "src/data", `${kind}.json`));
    const outDir = path.join(root, "src/assets/gen", kind);
    await mkdir(outDir, { recursive: true });

    for (const entry of catalog) {
      if (args.ids && !args.ids.has(entry.id)) continue;
      const subject = subjects[kind]?.[entry.id];
      if (!subject) {
        console.warn(`! ${kind}/${entry.id}: no subject in tools/comfy/subjects.json, skipped`);
        continue;
      }
      const outFile = path.join(outDir, `${entry.id}.webp`);
      if (existsSync(outFile) && !args.force) {
        console.log(`= ${kind}/${entry.id}: exists (use --force to redo)`);
        continue;
      }

      const kindStyle = style[kind];
      const [width, height] = looksLikeLargeModel(checkpoint) ? kindStyle.size : [512, 512];
      const positive = kindStyle.positive.replace("{{subject}}", subject);
      const seed = seedFromId(entry.id, args.reroll);

      if (args.dryRun) {
        console.log(`> ${kind}/${entry.id} seed=${seed} ${width}x${height}\n  + ${positive}\n  - ${style.negative}`);
        continue;
      }

      const workflow = fillWorkflow(template, {
        checkpoint, positive, negative: style.negative, width, height, seed, steps, cfg,
        prefix: `body-maker/${kind}/${entry.id}`,
      });

      const started = Date.now();
      try {
        const raw = await client.run(workflow);
        const cutout = kindStyle.removeBackground ? await removeBackground(raw) : raw;
        await writeFile(outFile, await finalize(cutout, { transparent: kindStyle.removeBackground }));
        done++;
        console.log(`+ ${kind}/${entry.id} (${((Date.now() - started) / 1000).toFixed(1)}s) -> ${path.relative(root, outFile)}`);
      } catch (error) {
        failed++;
        console.error(`x ${kind}/${entry.id}: ${error.message}`);
      }
    }
  }
  if (!args.dryRun) console.log(`Done: ${done} generated, ${failed} failed.`);
  if (failed) process.exitCode = 1;
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
