import { beforeEach, describe, expect, it } from "vitest";

import { opponents } from "../game/catalog";
import { createRng } from "../game/rng";
import { GIFT_PRICE } from "../game/rewards";
import { useGameStore } from "./gameStore";

const store = () => useGameStore.getState();

describe("game store", () => {
  beforeEach(() => store().reset());

  it("opens a gift into the inventory", () => {
    const before = store().inventory.length;
    const ids = store().openGift(createRng(5));
    expect(ids).toHaveLength(3);
    expect(store().inventory).toHaveLength(before + 3);
    expect(store().gifts).toBe(0);
    expect(store().openGift()).toEqual([]);
  });

  it("buys a gift only with enough coins", () => {
    useGameStore.setState({ coins: GIFT_PRICE - 1 });
    store().buyGift();
    expect(store().gifts).toBe(1);
    useGameStore.setState({ coins: GIFT_PRICE });
    store().buyGift();
    expect(store()).toMatchObject({ gifts: 2, coins: 0 });
  });

  it("equips items into their slot", () => {
    useGameStore.setState({ gifts: 1 });
    store().openGift(createRng(1));
    const entry = store().inventory.at(-1);
    store().equip(entry.uid);
    const slot = Object.keys(store().equipped).find((s) => store().equipped[s] === entry.uid);
    expect(slot).toBeTruthy();
    store().unequip(slot);
    expect(store().equipped[slot]).toBeNull();
  });

  it("spends stat points", () => {
    const points = store().statPoints;
    store().allocatePoint("attack");
    expect(store().allocated.attack).toBe(1);
    expect(store().statPoints).toBe(points - 1);
    useGameStore.setState({ statPoints: 0 });
    store().allocatePoint("attack");
    expect(store().allocated.attack).toBe(1);
  });

  it("applies a win, consumes the booster and grants rank points", () => {
    useGameStore.setState({ xp: 290 });
    const summary = store().finishMatch(
      { opponent: opponents[0], outcome: "win", score: { player: 3, opponent: 1 }, boosterId: "coach" },
      createRng(2)
    );
    expect(store().record.wins).toBe(1);
    expect(store().gifts).toBe(2);
    expect(summary.rankUp).toBe(1);
    expect(store().statPoints).toBe(3 + summary.statPoints);
    expect(store().boosters.coach).toBe(summary.boosterId === "coach" ? 1 : 0);
    expect(store().history[0]).toMatchObject({ opponentId: opponents[0].id, outcome: "win" });
  });
});
