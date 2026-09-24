// Image processing for the layered character: masks from the SVG silhouettes,
// splitting the generated base, and cutting clothing layers out of Klein edits.
import sharp from "sharp";

import {
  BOOT_PATH, BOOT_RIGHT, CHARACTER_CANVAS as C, GLOVE_PATH, GLOVE_RIGHT, SHIRT_PATH, SHIRT_TRANSFORM, SHORTS_PATH, TUCK_Y,
} from "../../src/Components/BodyMaker/bodyPaths.js";
import { removeBackground } from "./postprocess.mjs";

export const W = C.px;
export const H = C.py;
const toBody = (x, y) => [x / C.scale + C.x, y / C.scale + C.y];

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${C.x} ${C.y} ${C.width} ${C.height}">` +
  `<rect x="-100" y="-100" width="500" height="800" fill="#000"/>${inner}</svg>`;

// One byte per pixel: 255 inside the shape, grown by `grow` px.
const maskOf = async (inner, grow = 0) => {
  let image = sharp(Buffer.from(svg(inner))).extractChannel(0);
  if (grow) image = sharp(await image.blur(grow).toBuffer()).threshold(10).extractChannel(0);
  return image.raw().toBuffer();
};

// Where each slot's clothing may appear.
export const slotArea = (slot) => {
  const white = 'fill="#fff"';
  if (slot === "shirt") {
    return maskOf(`<clipPath id="t"><rect x="-50" y="-50" width="400" height="${TUCK_Y + 50}"/></clipPath>` +
      `<g clip-path="url(#t)"><path d="${SHIRT_PATH}" transform="${SHIRT_TRANSFORM}" ${white}/></g>`, 14);
  }
  if (slot === "shorts") return maskOf(`<path d="${SHORTS_PATH}" ${white}/>`, 16);
  if (slot === "boots") return maskOf(`<path d="${BOOT_PATH}" ${white}/><path d="${BOOT_PATH}" transform="${BOOT_RIGHT}" ${white}/><rect x="10" y="470" width="170" height="80" ${white}/>`, 10);
  if (slot === "gloves") return maskOf(`<path d="${GLOVE_PATH}" ${white}/><path d="${GLOVE_PATH}" transform="${GLOVE_RIGHT}" ${white}/>`, 22);
  throw new Error(`Unknown slot ${slot}`);
};

const rgba = async (png) => sharp(png).resize(W, H).ensureAlpha().raw().toBuffer();
const toPng = (raw) => sharp(raw, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
const lum = (buf, i, stride) => 0.299 * buf[i * stride] + 0.587 * buf[i * stride + 1] + 0.114 * buf[i * stride + 2];

// Shrinks alpha by one pixel to drop the light halo left by background removal.
const erodeAlpha = (buf) => {
  const alpha = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) alpha[i] = buf[i * 4 + 3];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      buf[i * 4 + 3] = Math.min(alpha[i], alpha[i - 1], alpha[i + 1], alpha[i - W], alpha[i + W]);
    }
  }
};

// Splits the generated base into the tintable skin layer and the untinted grey underwear,
// and removes the generated head (the SVG head is drawn on top). Returns the reference
// skin luminance the app uses to tint the skin.
export const splitBase = async (basePng) => {
  const cut = await rgba(await removeBackground(basePng));
  erodeAlpha(cut);
  const shorts = await maskOf(`<path d="${SHORTS_PATH}" fill="#fff"/>`, 16);
  const skin = Buffer.from(cut);
  const underwear = Buffer.alloc(W * H * 4);
  let skinSum = 0, skinCount = 0;

  for (let i = 0; i < W * H; i++) {
    const [bx, by] = toBody(i % W, Math.floor(i / W));
    const neck = bx > 80 && bx < 114 && by > 55;
    if (by < 82 && !neck) {
      skin[i * 4 + 3] = 0;
      continue;
    }
    const [r, g, b] = [cut[i * 4], cut[i * 4 + 1], cut[i * 4 + 2]];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const saturation = max ? (max - min) / max : 0;
    const l = lum(cut, i, 4);
    if (shorts[i] > 127 && saturation < 0.12 && l > 70) {
      underwear.set(cut.subarray(i * 4, i * 4 + 4), i * 4);
      skin[i * 4 + 3] = 0;
    } else if (skin[i * 4 + 3] === 255 && saturation > 0.12 && l > 120) {
      skinSum += l;
      skinCount++;
    }
  }
  return { skin: await toPng(skin), underwear: await toPng(underwear), skinLum: Math.round(skinSum / skinCount) };
};

// Light, moderately saturated warm pixels: the generated skin. Clothing layers drop them,
// because Klein repaints bits of arm and leg next to the clothes and those would not follow
// the in-app skin tint. Gold, orange and red trims are far more saturated, so they stay.
export const isSkinLike = (r, g, b) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max < 110 || max === min) return false;
  const saturation = (max - min) / max;
  if (saturation < 0.1 || saturation > 0.5 || max !== r) return false;
  const hue = (60 * (g - b)) / (max - min); // red is the max channel here
  return hue >= 5 && hue <= 38;
};

// Keeps the pixels the edit changed compared to the base, within the slot area.
// cutBelowY (body units) drops everything under it, e.g. the belt Klein adds under a tucked shirt.
export const extractLayer = async (editPng, basePng, area, { cutBelowY = null, threshold = 14, softness = 22, dropSkin = true } = {}) => {
  const edit = await rgba(editPng);
  const base = await rgba(basePng);
  const floor = new Uint8Array(W * H); // Klein's grey floor shadow on the white background
  for (let i = 0; i < W * H; i++) {
    const d = Math.max(...[0, 1, 2].map((c) => Math.abs(edit[i * 4 + c] - base[i * 4 + c])));
    let a = Math.min(1, Math.max(0, (d - threshold) / softness));
    if (area[i] < 128) a = 0;
    if (dropSkin && isSkinLike(edit[i * 4], edit[i * 4 + 1], edit[i * 4 + 2])) a = 0;
    // Klein likes to add a soft grey floor shadow on the white background: drop it.
    const baseIsBackground = base[i * 4] > 235 && base[i * 4 + 1] > 235 && base[i * 4 + 2] > 235;
    const [r, g, b] = [edit[i * 4], edit[i * 4 + 1], edit[i * 4 + 2]];
    if (baseIsBackground && Math.min(r, g, b) > 170 && Math.max(r, g, b) - Math.min(r, g, b) < 20) floor[i] = 1;
    if (cutBelowY !== null && toBody(0, Math.floor(i / W))[1] > cutBelowY) a = 0;
    edit[i * 4 + 3] = Math.round(a * 255);
  }
  // A light blur on alpha closes pinholes in flat areas where the edit matched the base by chance.
  const alpha = await sharp(edit, { raw: { width: W, height: H, channels: 4 } }).extractChannel(3).blur(1.2).raw().toBuffer();
  for (let i = 0; i < W * H; i++) edit[i * 4 + 3] = alpha[i] > 60 && !floor[i] ? Math.min(255, alpha[i] * 1.6) : 0;
  return toPng(edit);
};

export const toWebp = (png) => sharp(png).webp({ quality: 90, alphaQuality: 90 }).toBuffer();
