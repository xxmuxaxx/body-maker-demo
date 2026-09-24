import { describe, expect, it } from "vitest";

import { items, opponents, ranks } from "./catalog";
import { createRng, pickWeighted } from "./rng";
import { rankIndexForXp, rankProgress } from "./ranks";
import { GIFT_SIZE, matchRewards, rarityWeights, rollGift } from "./rewards";
import { BASE_STATS, computeStats } from "./stats";

describe("ranks", () => {
  it("maps xp to ranks by threshold", () => {
    expect(rankIndexForXp(0)).toBe(0);
    expect(rankIndexForXp(ranks[1].minXp - 1)).toBe(0);
    expect(rankIndexForXp(ranks[1].minXp)).toBe(1);
    expect(rankIndexForXp(10 ** 9)).toBe(ranks.length - 1);
  });

  it("reports progress to the next rank", () => {
    expect(rankProgress(ranks[1].minXp / 2).percent).toBe(50);
    expect(rankProgress(10 ** 9)).toMatchObject({ next: null, percent: 100 });
  });
});

describe("rewards", () => {
  it("rolls gifts from the catalog", () => {
    const ids = rollGift(createRng(3), 0);
    expect(ids).toHaveLength(GIFT_SIZE);
    ids.forEach((id) => expect(items.some((item) => item.id === id)).toBe(true));
  });

  it("makes epic items more likely at higher ranks", () => {
    expect(rarityWeights(4).epic).toBeGreaterThan(rarityWeights(0).epic);
    expect(rarityWeights(4).common).toBeLessThan(rarityWeights(0).common);
  });

  it("pays more for a win than a draw than a loss", () => {
    const opponent = opponents[2];
    const win = matchRewards("win", opponent, createRng(1));
    const draw = matchRewards("draw", opponent, createRng(1));
    const loss = matchRewards("loss", opponent, createRng(1));
    expect(win.xp).toBeGreaterThan(draw.xp);
    expect(draw.xp).toBeGreaterThan(loss.xp);
    expect(win.gifts).toBe(1);
    expect(loss.gifts).toBe(0);
  });

  it("picks weighted keys proportionally", () => {
    const rng = createRng(9);
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 2000; i++) counts[pickWeighted(rng, { a: 3, b: 1 })]++;
    expect(counts.a / 2000).toBeGreaterThan(0.7);
    expect(counts.a / 2000).toBeLessThan(0.8);
  });
});

describe("stats", () => {
  it("sums base, allocated points, equipped items and booster", () => {
    const state = {
      allocated: { attack: 2, defense: 0, agility: 1 },
      inventory: [
        { uid: 1, itemId: "training-shirt" },
        { uid: 2, itemId: "golden-boots" },
      ],
      equipped: { shirt: 1, shorts: null, boots: 2, gloves: null },
    };
    const { total } = computeStats(state, "coach");
    expect(total).toEqual({
      attack: BASE_STATS.attack + 2 + 0 + 4 + 3,
      defense: BASE_STATS.defense + 0 + 1 + 0,
      agility: BASE_STATS.agility + 1 + 1 + 2,
    });
  });
});

describe("catalog", () => {
  it("has every rarity for gift rolls", () => {
    for (const rarity of ["common", "rare", "epic"]) {
      expect(items.some((item) => item.rarity === rarity)).toBe(true);
    }
  });

  it("describes how every item looks on the character", () => {
    items.forEach((item) => expect(item.look?.base, item.id).toMatch(/^#[0-9A-F]{6}$/i));
  });

  it("has unique ids and opponents reachable by rank", () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    opponents.forEach((o) => expect(o.minRank).toBeLessThan(ranks.length));
  });
});
