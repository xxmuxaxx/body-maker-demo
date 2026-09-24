import items from "../data/items.json";
import boosters from "../data/boosters.json";
import opponents from "../data/opponents.json";
import ranks from "../data/ranks.json";

export { items, boosters, opponents, ranks };

const byId = (list) => Object.fromEntries(list.map((entry) => [entry.id, entry]));

export const itemsById = byId(items);
export const boostersById = byId(boosters);
export const opponentsById = byId(opponents);

export const SLOTS = [
  { id: "shirt", title: "Футболка" },
  { id: "shorts", title: "Шорты" },
  { id: "boots", title: "Бутсы" },
  { id: "gloves", title: "Перчатки" },
];

export const RARITY_TITLES = {
  common: "Обычный",
  rare: "Редкий",
  epic: "Эпический",
};
