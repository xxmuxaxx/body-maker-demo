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
    return maskOf(`<clipPath id="t"><rect x="-50" y="-50" width="400" height="${TUCK_Y + 90}"/></clipPath>` +
      `<g clip-path="url(#t)"><path d="${SHIRT_PATH}" transform="${SHIRT_TRANSFORM}" ${white}/></g>`, 26);
  }
  if (slot === "shorts") return maskOf(`<path d="${SHORTS_PATH}" ${white}/>`, 26);
  if (slot === "boots") return maskOf(`<path d="${BOOT_PATH}" ${white}/><path d="${BOOT_PATH}" transform="${BOOT_RIGHT}" ${white}/><rect x="5" y="465" width="180" height="85" ${white}/>`, 14);
  if (slot === "gloves") return maskOf(`<path d="${GLOVE_PATH}" ${white}/><path d="${GLOVE_PATH}" transform="${GLOVE_RIGHT}" ${white}/>`, 30);
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

// Splits a generated base into the tintable skin layer and the untinted grey underwear
// (bottom: shorts; top: the women's sports top), and removes the generated head (the SVG
// head is drawn on top). Returns the reference skin luminance the app tints against.
export const UNDERWEAR_SPLIT_Y = 200;

export const splitBase = async (basePng) => {
  const cut = await rgba(await removeBackground(basePng));
  // Background enclosed between an arm and the body is not reachable from the edges: the base
  // itself has no white, so any near-white pixel left is background.
  for (let i = 0; i < W * H; i++) {
    if (Math.min(cut[i * 4], cut[i * 4 + 1], cut[i * 4 + 2]) > 238) cut[i * 4 + 3] = 0;
  }
  erodeAlpha(cut);
  // Heavier builds wear longer shorts than the SVG silhouette, hence the band over the hips.
  const torso = await maskOf(
    `<path d="${SHORTS_PATH}" fill="#fff"/><path d="${SHIRT_PATH}" transform="${SHIRT_TRANSFORM}" fill="#fff"/>` +
    `<rect x="20" y="200" width="150" height="135" fill="#fff"/>`, 24);
  const skin = Buffer.from(cut);
  const top = Buffer.alloc(W * H * 4);
  const bottom = Buffer.alloc(W * H * 4);
  let skinSum = 0, skinCount = 0, topCount = 0;
  let shortsTop = Infinity;
  const underwearPixels = [];
  const skinRgb = [];

  for (let i = 0; i < W * H; i++) {
    const [bx, by] = toBody(i % W, Math.floor(i / W));
    const neck = bx > 78 && bx < 116 && by > 55;
    if (by < 82 && !neck) {
      skin[i * 4 + 3] = 0;
      continue;
    }
    const [r, g, b] = [cut[i * 4], cut[i * 4 + 1], cut[i * 4 + 2]];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const saturation = max ? (max - min) / max : 0;
    const l = lum(cut, i, 4);
    if (cut[i * 4 + 3] > 0 && torso[i] > 127 && saturation < 0.12 && l > 70) {
      if (by < UNDERWEAR_SPLIT_Y) topCount++;
      else if (bx > 60 && bx < 130) shortsTop = Math.min(shortsTop, by);
      (by < UNDERWEAR_SPLIT_Y ? top : bottom).set(cut.subarray(i * 4, i * 4 + 4), i * 4);
      underwearPixels.push(i);
    } else if (skin[i * 4 + 3] === 255 && saturation > 0.12 && l > 120) {
      skinSum += l;
      skinCount++;
      if (skinCount % 7 === 0) skinRgb.push([r, g, b]);
    }
  }
  // Under the underwear the skin layer gets a flat skin color instead of a hole: clothes that
  // came out smaller than the grey underwear would otherwise show the background.
  const median = [0, 1, 2].map((c) => skinRgb.map((p) => p[c]).sort((a, b) => a - b)[Math.floor(skinRgb.length / 2)]);
  for (const i of underwearPixels) {
    skin[i * 4] = median[0];
    skin[i * 4 + 1] = median[1];
    skin[i * 4 + 2] = median[2];
    skin[i * 4 + 3] = 255;
  }
  const hasTop = topCount > 3000; // a real sports top, not a few greyish pixels
  return {
    skin: await toPng(skin),
    underwear: await toPng(bottom),
    underwearTop: hasTop ? await toPng(top) : null,
    skinLum: Math.round(skinSum / skinCount),
    shortsTop: Math.round(shortsTop),
  };
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

// Everything above this line (body units) belongs to the head; below it only hair is kept.
export const CHIN_Y = 84;

// Cuts a generated head (ash grey hair on purpose, magenta clothes) into three layers the app
// recolors: skin (tinted like the body), hair with brows (tinted with the hair color) and ink
// (outlines and eyes, never tinted). Below the chin only the grey hair is kept.
// Eye boxes (body units) always go to ink: some variants draw light grey irises.
const EYE_BOXES = [[79, 43, 94, 51.5], [102, 43, 117, 51.5]];

export const splitHead = async (editPng) => {
  const edit = await rgba(await removeBackground(editPng));
  const skin = Buffer.alloc(W * H * 4);
  const hair = Buffer.alloc(W * H * 4);
  const ink = Buffer.alloc(W * H * 4);
  const skinValues = [], hairValues = [];

  // Grey pixels below the chin; only solid areas of them are hair (thin lines are the
  // source body's outline and would not match the other bases' silhouettes).
  const greyBelow = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const [r, g, b] = [edit[i * 4], edit[i * 4 + 1], edit[i * 4 + 2]];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (edit[i * 4 + 3] && max && (max - min) / max < 0.16 && lum(edit, i, 4) > 80) greyBelow[i] = 1;
  }
  const solid = (i) => {
    const x = i % W, y = Math.floor(i / W);
    let n = 0;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H) n += greyBelow[yy * W + xx];
    }
    return n >= 30; // of 49
  };

  for (let i = 0; i < W * H; i++) {
    const [bx, by] = toBody(i % W, Math.floor(i / W));
    if (edit[i * 4 + 3] === 0 || bx < 20 || bx > 175 || by > 260) continue;
    const [r, g, b] = [edit[i * 4], edit[i * 4 + 1], edit[i * 4 + 2]];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const saturation = max ? (max - min) / max : 0;
    const l = lum(edit, i, 4);
    const isHair = saturation < 0.16 && l > 55;
    const inEye = EYE_BOXES.some(([x1, y1, x2, y2]) => bx >= x1 && bx <= x2 && by >= y1 && by <= y2);
    if (by > CHIN_Y && !(greyBelow[i] && solid(i))) continue;
    const pixel = edit.subarray(i * 4, i * 4 + 4);
    if (l < 55 || (inEye && saturation < 0.16)) ink.set(pixel, i * 4);
    else if (isHair) { hair.set(pixel, i * 4); hairValues.push(l); }
    else { skin.set(pixel, i * 4); if (saturation > 0.12 && l > 120) skinValues.push(l); }
  }
  const percentile = (values, p) => values.sort((a, b) => a - b)[Math.floor(values.length * p)] ?? 200;
  return {
    skin: await toPng(skin),
    hair: await toPng(hair),
    ink: await toPng(ink),
    skinLum: Math.round(percentile(skinValues, 0.5)),
    hairLum: Math.round(percentile(hairValues, 0.9)),
  };
};
