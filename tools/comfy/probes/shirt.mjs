// Scratch probe: inpaint a shirt onto the stylized base inside the SVG shirt silhouette.
// Run from the repo root: node tools/comfy/probes/<name>.mjs <args>
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { createClient } from "../client.mjs";

const [outDir] = process.argv.slice(2);
const W = 640, H = 1536, VIEWBOX = "-18.8 -10.3 228.6 548.6";
const client = createClient({ url: process.env.COMFY_URL, auth: process.env.COMFY_AUTH });

const outfit = readFileSync("src/Components/BodyMaker/Outfit.jsx", "utf8");
const SHIRT_PATH = outfit.match(/const SHIRT_PATH = "([^"]+)"/)[1];
const SHIRT_TRANSFORM = outfit.match(/const SHIRT_TRANSFORM = "([^"]+)"/)[1];
const TUCK_Y = 234;

const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${VIEWBOX}">
  <rect x="-50" y="-50" width="400" height="700" fill="#000"/>
  <clipPath id="tuck"><rect x="-50" y="-50" width="400" height="${TUCK_Y + 50}"/></clipPath>
  <g clip-path="url(#tuck)"><path d="${SHIRT_PATH}" transform="${SHIRT_TRANSFORM}" fill="#fff"/></g>
</svg>`;
const mask = await sharp(Buffer.from(maskSvg)).png().toBuffer();
writeFileSync(`${outDir}/mask-shirt.png`, mask);

const baseName = await client.upload(readFileSync(`${outDir}/base-0.6.png`), "probe-base-styled.png");
const maskName = await client.upload(mask, "probe-mask-shirt.png");

const prompt = "flat vector cartoon illustration of a football player wearing a white short sleeve football jersey with golden collar, golden sleeve cuffs and a golden captain armband on the sleeve, small golden crest on the chest, fabric folds, bold dark ink outlines, soft cel shading, clean simple shapes, mobile game character art, plain white background";

const workflow = (denoise, seed) => ({
  1: { class_type: "UNETLoader", inputs: { unet_name: "krea2_turbo_fp8_scaled.safetensors", weight_dtype: "default" } },
  2: { class_type: "CLIPLoader", inputs: { clip_name: "qwen3vl_4b_fp8_uncensored.safetensors", type: "krea2", device: "default" } },
  3: { class_type: "VAELoader", inputs: { vae_name: "qwen_image_vae.safetensors" } },
  4: { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["2", 0] } },
  5: { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
  6: { class_type: "LoadImage", inputs: { image: baseName } },
  7: { class_type: "VAEEncode", inputs: { pixels: ["6", 0], vae: ["3", 0] } },
  11: { class_type: "LoadImageMask", inputs: { image: maskName, channel: "red" } },
  12: { class_type: "GrowMask", inputs: { mask: ["11", 0], expand: 10, tapered_corners: true } },
  13: { class_type: "SetLatentNoiseMask", inputs: { samples: ["7", 0], mask: ["12", 0] } },
  8: { class_type: "KSampler", inputs: { model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["13", 0], seed, steps: 8, cfg: 1, sampler_name: "euler", scheduler: "simple", denoise } },
  9: { class_type: "VAEDecode", inputs: { samples: ["8", 0], vae: ["3", 0] } },
  10: { class_type: "SaveImage", inputs: { images: ["9", 0], filename_prefix: "body-maker/probe/shirt" } },
});

for (const [denoise, seed] of [[0.85, 3], [1, 3], [1, 11]]) {
  const t = Date.now();
  writeFileSync(`${outDir}/shirt-${denoise}-${seed}.png`, await client.run(workflow(denoise, seed)));
  console.log(`denoise ${denoise} seed ${seed}: ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
