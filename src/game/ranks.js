import { ranks } from "./catalog";

export const rankIndexForXp = (xp) => {
  let index = 0;
  ranks.forEach((rank, i) => {
    if (xp >= rank.minXp) index = i;
  });
  return index;
};

// Progress towards the next rank; for the last rank the bar is full.
export const rankProgress = (xp) => {
  const index = rankIndexForXp(xp);
  const current = ranks[index];
  const next = ranks[index + 1] ?? null;
  const percent = next ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100 : 100;
  return { index, current, next, percent: Math.round(percent) };
};
