// Mixes a hex color with black (amount > 0) or white (amount < 0).
export const shade = (hex, amount) => {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const target = amount > 0 ? 0 : 255;
  const k = Math.abs(amount);
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16);
    return Math.round(c + (target - c) * k).toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
};
