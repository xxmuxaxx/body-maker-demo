import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { createClient } from "./client.mjs";
import { finalize, removeBackground } from "./postprocess.mjs";
import { fillWorkflow, seedFromId } from "./workflow.mjs";
import template from "./workflows/txt2img.json";
import krea from "./workflows/krea2-turbo.json";
import subjects from "./subjects.json";
import items from "../../src/data/items.json";
import boosters from "../../src/data/boosters.json";
import opponents from "../../src/data/opponents.json";

describe("workflow template", () => {
  it("fills placeholders, keeping numbers as numbers", () => {
    const wf = fillWorkflow(template, {
      checkpoint: "model.safetensors", positive: "a ball", negative: "text",
      width: 512, height: 512, seed: 42, steps: 20, cfg: 7, prefix: "x/y",
    });
    expect(wf["1"].inputs.ckpt_name).toBe("model.safetensors");
    expect(wf["5"].inputs.seed).toBe(42);
    expect(wf["4"].inputs.width).toBe(512);
    expect(wf["5"].inputs.model).toEqual(["1", 0]);
    expect(JSON.stringify(wf)).not.toContain("{{");
  });

  it("fills the Krea 2 Turbo workflow", () => {
    const wf = fillWorkflow(krea, { positive: "a ball", width: 1024, height: 1024, seed: 7, prefix: "x/y" });
    expect(wf["7"].inputs.seed).toBe(7);
    expect(wf["4"].inputs.text).toBe("a ball");
    expect(JSON.stringify(wf)).not.toContain("{{");
  });

  it("fails loudly on a missing value", () => {
    expect(() => fillWorkflow(template, {})).toThrow(/placeholder/);
  });

  it("derives stable, distinct seeds", () => {
    expect(seedFromId("coach")).toBe(seedFromId("coach"));
    expect(seedFromId("coach")).not.toBe(seedFromId("energy"));
    expect(seedFromId("coach", 1)).not.toBe(seedFromId("coach"));
  });

  it("has a prompt subject for every catalog entry", () => {
    for (const [kind, list] of [["items", items], ["boosters", boosters], ["opponents", opponents]]) {
      for (const entry of list) expect(subjects[kind][entry.id], `${kind}/${entry.id}`).toBeTruthy();
    }
  });
});

describe("post-processing", () => {
  it("cuts out a plain background and keeps the object", async () => {
    // White 64x64 canvas with a red 20x20 square in the middle.
    const square = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#d00000" } }).png().toBuffer();
    const input = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#ffffff" } })
      .composite([{ input: square, left: 22, top: 22 }]).png().toBuffer();

    const { data, info } = await sharp(await removeBackground(input)).raw().toBuffer({ resolveWithObject: true });
    const alpha = (x, y) => data[(y * info.width + x) * 4 + 3];
    expect(alpha(0, 0)).toBe(0);
    expect(alpha(32, 32)).toBe(255);

    const out = await sharp(await finalize(await removeBackground(input))).metadata();
    expect(out.format).toBe("webp");
    expect(out.width).toBeLessThanOrEqual(24);
  });
});

describe("ComfyUI client", () => {
  it("queues, polls and downloads the saved image", async () => {
    const calls = [];
    let polls = 0;
    const fakeFetch = async (url, init = {}) => {
      calls.push({ url, init });
      const reply = (body) => new Response(typeof body === "string" ? body : JSON.stringify(body));
      if (url.endsWith("/prompt")) return reply({ prompt_id: "p1", node_errors: {} });
      if (url.includes("/history/p1")) {
        polls++;
        return reply(polls < 2 ? {} : { p1: { outputs: { 7: { images: [{ filename: "a.png", subfolder: "s", type: "output" }] } } } });
      }
      if (url.includes("/view?")) return reply("PNGDATA");
      return new Response("nope", { status: 404 });
    };

    const client = createClient({ url: "https://comfy.test/", auth: "u:p", fetchImpl: fakeFetch, pollMs: 1 });
    const image = await client.run({ any: "workflow" });

    expect(image.toString()).toBe("PNGDATA");
    expect(calls[0].init.headers.Authorization).toBe(`Basic ${Buffer.from("u:p").toString("base64")}`);
    expect(calls.at(-1).url).toContain("filename=a.png");
    expect(polls).toBe(2);
  });

  it("surfaces workflow errors", async () => {
    const fakeFetch = async () => new Response(JSON.stringify({ error: "bad" }), { status: 400 });
    const client = createClient({ url: "https://comfy.test", fetchImpl: fakeFetch });
    await expect(client.run({})).rejects.toThrow(/400/);
  });
});
