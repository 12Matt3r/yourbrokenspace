import '@testing-library/jest-dom';

// jsdom doesn’t implement matchMedia by default
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Stable localStorage mock with event dispatch for cross-tab tests (optional)
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
  removeItem(k: string) { this.store.delete(k); }
  setItem(k: string, v: string) {
    const prev = this.getItem(k);
    this.store.set(k, v);
    window.dispatchEvent(new StorageEvent('storage', { key: k, oldValue: prev, newValue: v }));
  }
}
Object.defineProperty(window, 'localStorage', { value: new MemoryStorage() });

// Minimal Next.js router shims if components use theming during navigation (optional)
// @ts-ignore
globalThis.nextRouterMock = { prefetch: () => Promise.resolve() };
