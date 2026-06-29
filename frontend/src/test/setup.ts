// jsdom's fork-worker localStorage doesn't expose .clear() — replace it with
// a full in-memory implementation before any test file runs.
const createStorage = () => {
  const data = new Map<string, string>()
  return {
    get length() { return data.size },
    key(i: number) { return [...data.keys()][i] ?? null },
    getItem(k: string) { return data.get(k) ?? null },
    setItem(k: string, v: string) { data.set(k, v) },
    removeItem(k: string) { data.delete(k) },
    clear() { data.clear() },
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createStorage(),
  writable: true,
  configurable: true,
})
