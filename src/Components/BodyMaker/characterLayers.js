// Raster layers made by tools/comfy/character.mjs (src/assets/character).
// Everything here degrades gracefully: without a manifest the character stays pure SVG,
// and an item without a layer falls back to its SVG outfit piece.
const files = import.meta.glob("../../assets/character/*.webp", { eager: true, import: "default" });
const manifests = import.meta.glob("../../assets/character/manifest.json", { eager: true, import: "default" });

export const characterManifest = Object.values(manifests)[0] ?? null;

export const layerUrl = (name) => files[`../../assets/character/${name}.webp`] ?? null;

export const hasRasterBody = Boolean(characterManifest?.skinLum && layerUrl("base"));

// feColorMatrix values that recolor a layer by luminance: out = color * lum / refLum.
export const tintMatrix = (hex, refLum) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / refLum);
  const row = (k) => `${k * 0.299} ${k * 0.587} ${k * 0.114} 0 0`;
  return `${row(r)} ${row(g)} ${row(b)} 0 0 0 1 0`;
};
