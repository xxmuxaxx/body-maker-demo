// Raster layers made by tools/comfy/character.mjs: src/assets/character/<base>/<layer>.webp,
// one base per sex and body type ("man-1" ... "woman-3").
// Everything here degrades gracefully: a base without files keeps the character pure SVG,
// and an item without a layer falls back to its SVG outfit piece.
const files = import.meta.glob("../../assets/character/*/*.webp", { eager: true, import: "default" });
const headFiles = import.meta.glob("../../assets/character/heads/*/*.webp", { eager: true, import: "default" });
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

// Generated heads: skin / hair / ink layers per hairstyle, plus beard overlays for men.
// See tools/comfy/character.mjs.
export const HAIRSTYLES = {
  woman: [
    { value: "bun", name: "пучок" },
    { value: "long", name: "длинные" },
    { value: "ponytail", name: "хвост" },
    { value: "bob", name: "каре" },
  ],
  man: [
    { value: "quiff", name: "кок" },
    { value: "buzz", name: "ёжик" },
    { value: "curly", name: "кудри" },
    { value: "long", name: "длинные" },
    { value: "bald", name: "лысый" },
  ],
};

export const BEARDS = [
  { value: "full", name: "полная" },
  { value: "goatee", name: "эспаньолка" },
];

// Appearance field that stores the hairstyle for each sex.
export const hairstyleField = (sex) => (sex === "woman" ? "femaleHair" : "maleHair");

export const headKeyFor = (sex, appearance = {}) => {
  if (sex === "woman") return `woman-${appearance.femaleHair ?? "bun"}`;
  // The SVG head's "hair off" switch maps to the bald head.
  const style = appearance.showHair === false ? "bald" : appearance.maleHair ?? "quiff";
  return `man-${style}`;
};

export const headInfo = (headKey) => (headKey ? manifest?.heads?.[headKey] ?? null : null);

export const headUrl = (headKey, part) => headFiles[`../../assets/character/heads/${headKey}/${part}.webp`] ?? null;

export const hasGeneratedHead = (headKey) => Boolean(headInfo(headKey) && headUrl(headKey, "skin"));

export const beardKeyFor = (sex, appearance = {}) => {
  if (sex === "woman" || !appearance.showBeard) return null;
  const key = `man-beard-${appearance.beardStyle ?? "full"}`;
  return headInfo(key) && headUrl(key, "beard") ? key : null;
};

export const availableHairstyles = (sex) =>
  HAIRSTYLES[sex === "woman" ? "woman" : "man"].filter((style) =>
    hasGeneratedHead(headKeyFor(sex, { [hairstyleField(sex)]: style.value })));

export const availableBeards = () => BEARDS.filter((beard) => headInfo(`man-beard-${beard.value}`));
