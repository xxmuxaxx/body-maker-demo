import { describe, expect, it } from "vitest";

import { createRng } from "./rng";
import {
  KICKS_PER_SIDE,
  ZONES,
  createMatch,
  currentTurn,
  isFinished,
  matchOutcome,
  missChance,
  playerSave,
  playerShoot,
  saveChance,
  score,
  zoneById,
} from "./penalty";

const even = { attack: 5, defense: 5, agility: 5 };

const playOut = (match, rng) => {
  let m = match;
  while (!isFinished(m)) {
    m = currentTurn(m) === "shoot" ? playerShoot(m, "bottom-left", rng) : playerSave(m, "left", rng);
  }
  return m;
};

describe("penalty chances", () => {
  it("never saves when the keeper dives the wrong way", () => {
    expect(saveChance(zoneById("bottom-left"), "right", 50, 0)).toBe(0);
  });

  it("makes top corners harder to save but easier to miss", () => {
    const top = zoneById("top-left");
    const bottom = zoneById("bottom-left");
    expect(saveChance(top, "left", 5, 5)).toBeLessThan(saveChance(bottom, "left", 5, 5));
    expect(missChance(top, 5, 5)).toBeGreaterThan(missChance(bottom, 5, 5));
  });

  it("rewards attack and agility", () => {
    const zone = zoneById("bottom-right");
    expect(missChance(zone, 15, 5)).toBeLessThan(missChance(zone, 5, 5));
    expect(saveChance(zone, "right", 15, 5)).toBeGreaterThan(saveChance(zone, "right", 5, 5));
  });

  it("keeps chances within bounds for extreme stats", () => {
    for (const zone of ZONES) {
      for (const [a, b] of [[0, 100], [100, 0]]) {
        expect(missChance(zone, a, b)).toBeGreaterThanOrEqual(0.02);
        expect(missChance(zone, a, b)).toBeLessThanOrEqual(0.45);
        expect(saveChance(zone, zone.col, a, b)).toBeGreaterThanOrEqual(0.1);
        expect(saveChance(zone, zone.col, a, b)).toBeLessThanOrEqual(0.92);
      }
    }
  });
});

describe("penalty match flow", () => {
  it("alternates shots and saves, starting with the player", () => {
    const rng = createRng(1);
    let match = createMatch({ player: even, opponent: even });
    expect(currentTurn(match)).toBe("shoot");
    match = playerShoot(match, "top-right", rng);
    expect(currentTurn(match)).toBe("save");
    expect(() => playerShoot(match, "top-right", rng)).toThrow();
    match = playerSave(match, "center", rng);
    expect(match.kicks.map((k) => k.side)).toEqual(["player", "opponent"]);
  });

  it("is deterministic for the same seed", () => {
    const a = playOut(createMatch({ player: even, opponent: even }), createRng(42));
    const b = playOut(createMatch({ player: even, opponent: even }), createRng(42));
    expect(a.kicks).toEqual(b.kicks);
  });

  it("ends early once the result can no longer change", () => {
    const player = { kicks: [] };
    // Player scored 3, opponent missed 3: opponent can reach at most 2.
    const kicks = [];
    for (let i = 0; i < 3; i++) {
      kicks.push({ side: "player", outcome: "goal" }, { side: "opponent", outcome: "miss" });
    }
    const match = { ...createMatch({ player: even, opponent: even }), ...player, kicks };
    expect(isFinished(match)).toBe(true);
    expect(matchOutcome(match)).toBe("win");
  });

  it("never takes more than five kicks per side", () => {
    for (let seed = 0; seed < 200; seed++) {
      const match = playOut(createMatch({ player: even, opponent: even }), createRng(seed));
      expect(match.kicks.length).toBeLessThanOrEqual(KICKS_PER_SIDE * 2);
      const { player, opponent } = score(match);
      expect(["win", "draw", "loss"]).toContain(matchOutcome(match));
      if (match.kicks.length === KICKS_PER_SIDE * 2 && player === opponent) {
        expect(matchOutcome(match)).toBe("draw");
      }
    }
  });

  it("gives the stronger side a clear edge", () => {
    const strong = { attack: 18, defense: 18, agility: 18 };
    const weak = { attack: 3, defense: 3, agility: 3 };
    let wins = 0;
    const rng = createRng(7);
    for (let i = 0; i < 400; i++) {
      // Random choices for the player so the edge comes from stats alone.
      let m = createMatch({ player: strong, opponent: weak });
      while (!isFinished(m)) {
        m = currentTurn(m) === "shoot"
          ? playerShoot(m, ZONES[Math.floor(rng() * ZONES.length)].id, rng)
          : playerSave(m, ["left", "center", "right"][Math.floor(rng() * 3)], rng);
      }
      if (matchOutcome(m) === "win") wins++;
    }
    expect(wins / 400).toBeGreaterThan(0.55);
  });
});
