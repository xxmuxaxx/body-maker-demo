import { boosters, items } from "./catalog";
import { pick, pickWeighted } from "./rng";

export const GIFT_PRICE = 150;
export const GIFT_SIZE = 3;
export const STAT_POINTS_PER_RANK = 3;
export const BOOSTER_DROP_CHANCE = 0.35;

export const rarityWeights = (rankIndex) => ({
  common: Math.max(70 - rankIndex * 10, 30),
  rare: 25 + rankIndex * 6,
  epic: 5 + rankIndex * 4,
});

export const rollGift = (rng, rankIndex, size = GIFT_SIZE) =>
  Array.from({ length: size }, () => {
    const rarity = pickWeighted(rng, rarityWeights(rankIndex));
    return pick(rng, items.filter((item) => item.rarity === rarity)).id;
  });

export const matchRewards = (outcome, opponent, rng) => {
  const { xp, coins } = opponent.reward;
  if (outcome === "win") {
    return {
      xp,
      coins,
      gifts: 1,
      boosterId: rng() < BOOSTER_DROP_CHANCE ? pick(rng, boosters).id : null,
    };
  }
  if (outcome === "draw") {
    return { xp: Math.floor(xp / 2), coins: Math.floor(coins / 3), gifts: 0, boosterId: null };
  }
  return { xp: 10, coins: 5, gifts: 0, boosterId: null };
};
