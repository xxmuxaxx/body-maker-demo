// Catalog JSON refers to images by file name; this resolves them to bundled URLs.
const files = import.meta.glob("../assets/img/*", { eager: true, import: "default" });

const byName = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop(), url])
);

export const imageUrl = (name) => (name ? byName[name] ?? null : null);
