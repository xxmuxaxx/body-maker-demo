import { describe, expect, it } from "vitest";

import { tintMatrix } from "./characterLayers";

const apply = (matrix, [r, g, b]) => {
  const m = matrix.split(" ").map(Number);
  return [0, 1, 2].map((row) => m[row * 5] * r + m[row * 5 + 1] * g + m[row * 5 + 2] * b);
};

describe("tintMatrix", () => {
  it("maps the reference luminance to the target color", () => {
    const grey = 200 / 255;
    const [r, g, b] = apply(tintMatrix("#AC6948", 200), [grey, grey, grey]);
    expect(r * 255).toBeCloseTo(0xac, 0);
    expect(g * 255).toBeCloseTo(0x69, 0);
    expect(b * 255).toBeCloseTo(0x48, 0);
  });

  it("keeps shading: darker input stays proportionally darker", () => {
    const [lightR] = apply(tintMatrix("#AC6948", 200), [0.8, 0.8, 0.8]);
    const [darkR] = apply(tintMatrix("#AC6948", 200), [0.4, 0.4, 0.4]);
    expect(darkR / lightR).toBeCloseTo(0.5, 5);
  });
});
