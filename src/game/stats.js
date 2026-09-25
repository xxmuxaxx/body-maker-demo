import { boostersById, itemsById } from "./catalog";

export const STAT_KEYS = ["attack", "defense", "agility"];

export const STAT_TITLES = {
  attack: "Нападение",
  defense: "Защита",
  agility: "Ловкость",
};

export const STAT_HINTS = {
  attack: "Точность и сила удара: реже мажешь, вратарю сложнее взять мяч",
  defense: "Давление на бьющего: соперник чаще промахивается",
  agility: "Реакция вратаря: выше шанс взять мяч, угадав угол",
};

export const BASE_STATS = { attack: 5, defense: 5, agility: 5 };

export const addStats = (...list) =>
  Object.fromEntries(
    STAT_KEYS.map((key) => [key, list.reduce((sum, stats) => sum + (stats?.[key] ?? 0), 0)])
  );

// Items worn by the player, resolved from inventory uids to catalog entries.
export const equippedItems = ({ inventory, equipped }) =>
  Object.values(equipped)
    .filter(Boolean)
    .map((uid) => inventory.find((entry) => entry.uid === uid))
    .filter(Boolean)
    .map((entry) => itemsById[entry.itemId]);

export const computeStats = (state, boosterId = null) => {
  const itemStats = addStats(...equippedItems(state).map((item) => item.stats));
  const boosterStats = boosterId ? boostersById[boosterId]?.effect : null;
  return {
    base: BASE_STATS,
    allocated: state.allocated,
    items: itemStats,
    booster: addStats(boosterStats),
    total: addStats(BASE_STATS, state.allocated, itemStats, boosterStats),
  };
};

// Equipped item per slot as { id, look }, for drawing the character's outfit.
export const outfitItems = ({ inventory, equipped }) =>
  Object.fromEntries(
    Object.entries(equipped).map(([slot, uid]) => {
      const entry = inventory.find((e) => e.uid === uid);
      return [slot, entry ? { id: entry.itemId, look: itemsById[entry.itemId].look } : null];
    })
  );
