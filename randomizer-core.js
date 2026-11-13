export const MAX_SELECTIONS = 5;
export const HISTORY_LIMIT = 10;
export const storageKey = type => "gnwaa-randomizer-" + type + "-v1";

export function toggleSelection(current, id) {
  const values = [...new Set(current)];
  if (values.includes(id)) return { values: values.filter(value => value !== id), limited: false };
  if (values.length >= MAX_SELECTIONS) return { values, limited: true };
  return { values: [...values, id], limited: false };
}

export function eligibleItems(items, selected = [], mode = "any") {
  const unique = [...new Map(items.map(item => [item.id, item])).values()];
  if (!selected.length) return unique;
  return unique.filter(item => {
    const categories = item.genres || item.categories || [];
    return mode === "all" ? selected.every(id => categories.includes(id)) : selected.some(id => categories.includes(id));
  });
}

// Rejection sampling keeps every index equally likely, including non-power-of-two pools.
export function randomIndex(length, cryptoSource = globalThis.crypto, fallback = Math.random) {
  if (!Number.isSafeInteger(length) || length < 1 || length > 0x100000000) return -1;
  if (cryptoSource?.getRandomValues) {
    try {
      const sample = new Uint32Array(1);
      const ceiling = Math.floor(0x100000000 / length) * length;
      do { cryptoSource.getRandomValues(sample); } while (sample[0] >= ceiling);
      return sample[0] % length;
    } catch { /* Restricted browsers can still draw. */ }
  }
  return Math.min(length - 1, Math.max(0, Math.floor(fallback() * length)));
}

export function pickItem(items, previousId = null, cryptoSource = globalThis.crypto, fallback = Math.random) {
  const unique = [...new Map(items.map(item => [item.id, item])).values()];
  const pool = unique.length > 1 ? unique.filter(item => item.id !== previousId) : unique;
  return pool[randomIndex(pool.length, cryptoSource, fallback)] || null;
}

export function readCollection(storage, type, items) {
  const empty = { favorites: [], history: [] };
  try {
    const data = JSON.parse(storage?.getItem(storageKey(type)) || "null");
    if (!data || typeof data !== "object") return empty;
    const valid = new Set(items.map(item => item.id));
    const favorites = Array.isArray(data.favorites) ? [...new Set(data.favorites.filter(id => valid.has(id)))] : [];
    const history = Array.isArray(data.history) ? data.history.filter(entry => entry && valid.has(entry.id) && Number.isFinite(entry.at)).slice(0, HISTORY_LIMIT) : [];
    return { favorites, history };
  } catch { return empty; }
}

export function writeCollection(storage, type, data) {
  try {
    if (!storage) return false;
    storage.setItem(storageKey(type), JSON.stringify({ favorites: data.favorites, history: data.history.slice(0, HISTORY_LIMIT) }));
    return true;
  } catch { return false; }
}

export function rememberDraw(history, id, at = Date.now()) {
  return [{ id, at }, ...history.filter(entry => entry.id !== id)].slice(0, HISTORY_LIMIT);
}

export function toggleFavorite(favorites, id) {
  return favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
}
