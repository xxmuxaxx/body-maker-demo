// Fills "{{name}}" placeholders in an API-format ComfyUI workflow.
// A value that is exactly "{{name}}" gets the raw value (so numbers stay numbers),
// placeholders inside longer strings are replaced as text.
export const fillWorkflow = (template, values) => {
  const fill = (node) => {
    if (typeof node === "string") {
      const whole = node.match(/^\{\{(\w+)\}\}$/);
      if (whole) {
        if (!(whole[1] in values)) throw new Error(`Workflow placeholder {{${whole[1]}}} has no value`);
        return values[whole[1]];
      }
      return node.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (!(key in values)) throw new Error(`Workflow placeholder {{${key}}} has no value`);
        return String(values[key]);
      });
    }
    if (Array.isArray(node)) return node.map(fill);
    if (node && typeof node === "object") {
      return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, fill(v)]));
    }
    return node;
  };
  return fill(template);
};

// Stable 32-bit seed from an id, so re-running gives the same picture.
export const seedFromId = (id, salt = 0) => {
  let hash = 2166136261 ^ salt;
  for (const char of id) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
