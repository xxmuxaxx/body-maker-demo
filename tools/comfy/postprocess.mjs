import sharp from "sharp";

// Makes the plain background transparent by flood-filling from the image edges:
// pixels close to the corner color become transparent, with a soft edge band.
export const removeBackground = async (input, { tolerance = 40, feather = 25 } = {}) => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const px = (x, y) => (y * width + x) * 4;

  const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
  const bg = [0, 1, 2].map((c) => corners.reduce((sum, [x, y]) => sum + data[px(x, y) + c], 0) / corners.length);
  const distance = (i) => Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);

  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, 0, x, height - 1);
  for (let y = 0; y < height; y++) stack.push(0, y, width - 1, y);

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const index = y * width + x;
    if (visited[index]) continue;
    visited[index] = 1;
    const i = index * 4;
    const d = distance(i);
    if (d > tolerance + feather) continue;
    // Inside the tolerance: fully transparent. In the feather band: partial alpha.
    data[i + 3] = d <= tolerance ? 0 : Math.round(((d - tolerance) / feather) * data[i + 3]);
    if (d <= tolerance) stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
};

// Crops empty borders and converts to a web-friendly size and format.
export const finalize = async (input, { maxSize = 512, transparent = true } = {}) => {
  let image = sharp(input);
  if (transparent) image = sharp(await image.trim().toBuffer());
  return image
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 95 })
    .toBuffer();
};
