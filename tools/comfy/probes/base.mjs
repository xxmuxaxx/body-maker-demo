// Scratch probe: img2img the SVG character with Krea 2 to see if it keeps the pose.
// Run from the repo root: node tools/comfy/probes/<name>.mjs <args>
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { createClient } from "../client.mjs";

const [svgPath, outDir] = process.argv.slice(2);
const W = 640, H = 1536, VIEWBOX = "-18.8 -10.3 228.6 548.6";
const client = createClient({ url: process.env.COMFY_URL, auth: process.env.COMFY_AUTH });

const svg = readFileSync(svgPath, "utf8")
  .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${VIEWBOX}">`);
const base = await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
  .composite([{ input: await sharp(Buffer.from(svg)).png().toBuffer() }]).png().toBuffer();
writeFileSync(`${outDir}/base-svg.png`, base);
const uploaded = await client.upload(base, "probe-base.png");

const prompt = "full body flat vector cartoon illustration of an athletic young male football player standing straight, front view, arms relaxed at the sides, bare chest, plain grey shorts, barefoot, bold dark ink outlines, soft cel shading, clean simple shapes, mobile game character art, plain white background";

const workflow = (denoise, seed) => ({
  1: { class_type: "UNETLoader", inputs: { unet_name: "krea2_turbo_fp8_scaled.safetensors", weight_dtype: "default" } },
  2: { class_type: "CLIPLoader", inputs: { clip_name: "qwen3vl_4b_fp8_uncensored.safetensors", type: "krea2", device: "default" } },
  3: { class_type: "VAELoader", inputs: { vae_name: "qwen_image_vae.safetensors" } },
  4: { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["2", 0] } },
  5: { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
  6: { class_type: "LoadImage", inputs: { image: uploaded } },
  7: { class_type: "VAEEncode", inputs: { pixels: ["6", 0], vae: ["3", 0] } },
  8: { class_type: "KSampler", inputs: { model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["7", 0], seed, steps: 8, cfg: 1, sampler_name: "euler", scheduler: "simple", denoise } },
  9: { class_type: "VAEDecode", inputs: { samples: ["8", 0], vae: ["3", 0] } },
  10: { class_type: "SaveImage", inputs: { images: ["9", 0], filename_prefix: "body-maker/probe/base" } },
});

for (const denoise of [0.45, 0.6, 0.75]) {
  const t = Date.now();
  const png = await client.run(workflow(denoise, 7));
  writeFileSync(`${outDir}/base-${denoise}.png`, png);
  console.log(`denoise ${denoise}: ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
