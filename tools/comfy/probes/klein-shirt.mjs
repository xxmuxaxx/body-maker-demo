// Run from the repo root: node tools/comfy/probes/klein-shirt.mjs <probe dir>
// Probe: Flux 2 Klein image edit puts a shirt on the stylized base; measures drift outside the shirt.
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { createClient } from "../client.mjs";
import { fillWorkflow } from "../workflow.mjs";

const [dir] = process.argv.slice(2);
const client = createClient({ url: process.env.COMFY_URL, auth: process.env.COMFY_AUTH });
const template = JSON.parse(readFileSync("tools/comfy/workflows/klein-edit.json", "utf8"));
const image = await client.upload(readFileSync(`${dir}/base-0.6.png`), "probe-base-styled.png");

const prompt = "Dress the man in a white short-sleeve football jersey with a golden collar, golden sleeve cuffs, a golden captain armband on his left sleeve and a small golden crest on the chest. The jersey is tucked into the grey shorts. Keep the pose, body proportions, arms, face, shorts, feet, white background and flat cartoon art style exactly unchanged.";

const W = 640, H = 1536;
const base = await sharp(readFileSync(`${dir}/base-0.6.png`)).removeAlpha().raw().toBuffer();
const mask = await sharp(readFileSync(`${dir}/mask-shirt.png`)).extractChannel(0).blur(12).raw().toBuffer();

for (const seed of [1, 2, 3, 4]) {
  const t = Date.now();
  const png = await client.run(fillWorkflow(template, { image, positive: prompt, seed, width: W, height: H, prefix: "body-maker/probe/klein" }));
  writeFileSync(`${dir}/klein-${seed}.png`, png);
  const out = await sharp(png).resize(W, H).removeAlpha().raw().toBuffer();
  // Mean color difference outside the (blurred) shirt area, 0..255.
  let sum = 0, n = 0;
  for (let i = 0; i < W * H; i++) {
    if (mask[i] > 0) continue;
    sum += (Math.abs(out[i * 3] - base[i * 3]) + Math.abs(out[i * 3 + 1] - base[i * 3 + 1]) + Math.abs(out[i * 3 + 2] - base[i * 3 + 2])) / 3;
    n++;
  }
  const meta = await sharp(png).metadata();
  console.log(`seed ${seed}: ${((Date.now() - t) / 1000).toFixed(1)}s, ${meta.width}x${meta.height}, drift outside shirt ${(sum / n).toFixed(2)}`);
}
