import { create } from "zustand";
import { persist } from "zustand/middleware";

import { itemsById } from "../game/catalog";
import { rankIndexForXp } from "../game/ranks";
import { GIFT_PRICE, STAT_POINTS_PER_RANK, matchRewards, rollGift } from "../game/rewards";
import { STAT_KEYS } from "../game/stats";

export const DEFAULT_APPEARANCE = {
  bodyColor: "#EDC4B0",
  hairColor: "#492B15",
  showHair: true,
  beardColor: "#492B15",
  showBeard: true,
  browsColor: "#492B15",
  showBrows: true,
  eyesColor: "#492B15",
  mouthColor: "#D9A191",
};

const HISTORY_LIMIT = 30;

const createInitialState = () => ({
  profile: {
    created: false,
    nickname: "",
    sex: "man",
    bodyType: "1",
    appearance: DEFAULT_APPEARANCE,
  },
  xp: 0,
  coins: 100,
  record: { wins: 0, draws: 0, losses: 0 },
  statPoints: 3,
  allocated: { attack: 0, defense: 0, agility: 0 },
  inventory: [
    { uid: 1, itemId: "training-shirt", isNew: false },
    { uid: 2, itemId: "training-shorts", isNew: false },
  ],
  nextUid: 3,
  equipped: { shirt: 1, shorts: 2, boots: null, gloves: null },
  boosters: { coach: 1, energy: 0, focus: 0 },
  gifts: 1,
  history: [],
});

const addToInventory = (state, itemIds) => {
  const added = itemIds.map((itemId, i) => ({ uid: state.nextUid + i, itemId, isNew: true }));
  return {
    inventory: [...state.inventory, ...added],
    nextUid: state.nextUid + added.length,
  };
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...createInitialState(),

      saveProfile: ({ nickname, sex, bodyType, appearance }) =>
        set((state) => ({
          profile: { ...state.profile, created: true, nickname, sex, bodyType, appearance },
        })),

      equip: (uid) =>
        set((state) => {
          const entry = state.inventory.find((e) => e.uid === uid);
          if (!entry) return {};
          const { slot } = itemsById[entry.itemId];
          return { equipped: { ...state.equipped, [slot]: uid } };
        }),

      unequip: (slot) => set((state) => ({ equipped: { ...state.equipped, [slot]: null } })),

      allocatePoint: (stat) =>
        set((state) => {
          if (state.statPoints <= 0 || !STAT_KEYS.includes(stat)) return {};
          return {
            statPoints: state.statPoints - 1,
            allocated: { ...state.allocated, [stat]: state.allocated[stat] + 1 },
          };
        }),

      markSeen: () =>
        set((state) => ({ inventory: state.inventory.map((e) => (e.isNew ? { ...e, isNew: false } : e)) })),

      buyGift: () =>
        set((state) => (state.coins >= GIFT_PRICE ? { coins: state.coins - GIFT_PRICE, gifts: state.gifts + 1 } : {})),

      // Returns the rolled item ids so the UI can show what was inside.
      openGift: (rng = Math.random) => {
        const state = get();
        if (state.gifts <= 0) return [];
        const itemIds = rollGift(rng, rankIndexForXp(state.xp));
        set({ gifts: state.gifts - 1, ...addToInventory(state, itemIds) });
        return itemIds;
      },

      // Applies the match result and returns a summary of what the player got.
      finishMatch: ({ opponent, outcome, score, boosterId }, rng = Math.random) => {
        const state = get();
        const rewards = matchRewards(outcome, opponent, rng);
        const rankBefore = rankIndexForXp(state.xp);
        const xp = state.xp + rewards.xp;
        const rankAfter = rankIndexForXp(xp);
        const statPoints = (rankAfter - rankBefore) * STAT_POINTS_PER_RANK;

        const boosters = { ...state.boosters };
        if (boosterId && boosters[boosterId] > 0) boosters[boosterId] -= 1;
        if (rewards.boosterId) boosters[rewards.boosterId] = (boosters[rewards.boosterId] ?? 0) + 1;

        const recordKey = { win: "wins", draw: "draws", loss: "losses" }[outcome];

        set({
          xp,
          coins: state.coins + rewards.coins,
          gifts: state.gifts + rewards.gifts,
          statPoints: state.statPoints + statPoints,
          boosters,
          record: { ...state.record, [recordKey]: state.record[recordKey] + 1 },
          history: [
            { date: Date.now(), opponentId: opponent.id, outcome, score, boosterId, rewards },
            ...state.history,
          ].slice(0, HISTORY_LIMIT),
        });

        return { ...rewards, statPoints, rankUp: rankAfter > rankBefore ? rankAfter : null };
      },

      reset: () => set(createInitialState()),
    }),
    {
      name: "body-maker-demo",
      version: 1,
      // Keep only data in storage, actions come from the store definition.
      partialize: (state) => Object.fromEntries(Object.entries(state).filter(([, v]) => typeof v !== "function")),
    }
  )
);
