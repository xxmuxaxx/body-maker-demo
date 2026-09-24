import { clamp, pickWeighted } from "./rng";

export const COLUMNS = ["left", "center", "right"];
export const ROWS = ["top", "bottom"];
export const ZONES = ROWS.flatMap((row) => COLUMNS.map((col) => ({ id: `${row}-${col}`, row, col })));
export const zoneById = (id) => ZONES.find((zone) => zone.id === id);

export const KICKS_PER_SIDE = 5;

// The top corners are harder to save but easier to miss.
export const missChance = (zone, shooterAttack, keeperDefense) => {
  const base = zone.row === "top" ? 0.2 : 0.06;
  return clamp(base - shooterAttack * 0.012 + keeperDefense * 0.01, 0.02, 0.45);
};

// The keeper can only save a shot when diving to the right column.
export const saveChance = (zone, diveCol, keeperAgility, shooterAttack) => {
  if (diveCol !== zone.col) return 0;
  const base = zone.col === "center" ? 0.8 : zone.row === "top" ? 0.45 : 0.65;
  return clamp(base + (keeperAgility - shooterAttack) * 0.035, 0.1, 0.92);
};

export const resolveKick = ({ zone, diveCol, shooter, keeper, rng }) => {
  if (rng() < missChance(zone, shooter.attack, keeper.defense)) return "miss";
  if (rng() < saveChance(zone, diveCol, keeper.agility, shooter.attack)) return "saved";
  return "goal";
};

// Opponent AI
export const aiDive = (rng) => pickWeighted(rng, { left: 0.375, center: 0.25, right: 0.375 });

export const aiShot = (rng, attack) => {
  const topChance = clamp(0.2 + attack * 0.02, 0.2, 0.6);
  const row = rng() < topChance ? "top" : "bottom";
  const col = pickWeighted(rng, { left: 0.4, center: 0.2, right: 0.4 });
  return zoneById(`${row}-${col}`);
};

export const createMatch = ({ player, opponent }) => ({
  player, // effective stats { attack, defense, agility }
  opponent,
  kicks: [], // { side: "player" | "opponent", zoneId, diveCol, outcome }
});

export const kicksBy = (match, side) => match.kicks.filter((kick) => kick.side === side);
const goalsBy = (match, side) => kicksBy(match, side).filter((kick) => kick.outcome === "goal").length;

export const score = (match) => ({ player: goalsBy(match, "player"), opponent: goalsBy(match, "opponent") });

// The player always shoots first, so turns alternate starting with "player".
export const currentTurn = (match) => (match.kicks.length % 2 === 0 ? "shoot" : "save");

export const isFinished = (match) => {
  const { player, opponent } = score(match);
  const playerLeft = KICKS_PER_SIDE - kicksBy(match, "player").length;
  const opponentLeft = KICKS_PER_SIDE - kicksBy(match, "opponent").length;
  if (playerLeft === 0 && opponentLeft === 0) return true;
  return player + playerLeft < opponent || opponent + opponentLeft < player;
};

export const matchOutcome = (match) => {
  const { player, opponent } = score(match);
  if (player > opponent) return "win";
  if (player < opponent) return "loss";
  return "draw";
};

const addKick = (match, kick) => ({ ...match, kicks: [...match.kicks, kick] });

export const playerShoot = (match, zoneId, rng) => {
  if (isFinished(match) || currentTurn(match) !== "shoot") throw new Error("Not the player's shot");
  const zone = zoneById(zoneId);
  const diveCol = aiDive(rng);
  const outcome = resolveKick({ zone, diveCol, shooter: match.player, keeper: match.opponent, rng });
  return addKick(match, { side: "player", zoneId, diveCol, outcome });
};

export const playerSave = (match, diveCol, rng) => {
  if (isFinished(match) || currentTurn(match) !== "save") throw new Error("Not the player's save");
  const zone = aiShot(rng, match.opponent.attack);
  const outcome = resolveKick({ zone, diveCol, shooter: match.opponent, keeper: match.player, rng });
  return addKick(match, { side: "opponent", zoneId: zone.id, diveCol, outcome });
};

