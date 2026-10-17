import "@testing-library/jest-dom/vitest";

// Node >= 22 exposes an experimental `localStorage` global that is unavailable
// without --localstorage-file, and it shadows/breaks jsdom's copy. Install a
// deterministic in-memory shim so auth tests behave the same everywhere.
type StorageShim = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
};

const createStore = (): StorageShim => {
  let store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store = new Map<string, string>();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: createStore(),
});
