// Raster layers made by tools/comfy/character.mjs: src/assets/character/<base>/<layer>.webp,
// one base per sex and body type ("man-1" ... "woman-3").
// Everything here degrades gracefully: a base without files keeps the character pure SVG,
// and an item without a layer falls back to its SVG outfit piece.
const files = import.meta.glob("../../assets/character/*/*.webp", { eager: true, import: "default" });
const manifests = import.meta.glob("../../assets/character/manifest.json", { eager: true, import: "default" });

const manifest = Object.values(manifests)[0] ?? null;

export const baseKeyFor = (sex, bodyType) => `${sex === "woman" ? "woman" : "man"}-${bodyType || "1"}`;

export const hairStyleFor = (sex) => (sex === "woman" ? "long" : "short");

export const baseInfo = (baseKey) => manifest?.bases?.[baseKey] ?? null;

export const layerUrl = (baseKey, name) => files[`../../assets/character/${baseKey}/${name}.webp`] ?? null;

export const hasRasterBody = (baseKey) => Boolean(baseInfo(baseKey)?.skinLum && layerUrl(baseKey, "base"));

// feColorMatrix values that recolor a layer by luminance: out = color * lum / refLum.
export const tintMatrix = (hex, refLum) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / refLum);
  const row = (k) => `${k * 0.299} ${k * 0.587} ${k * 0.114} 0 0`;
  return `${row(r)} ${row(g)} ${row(b)} 0 0 0 1 0`;
};
