import type { PuzzleProgress } from "./types";

/**
 * Player progress store. The localStorage key and record shape are unchanged
 * from the original page, so existing players keep their solves, hints and
 * boards across the rewrite.
 */
export const PROGRESS_KEY = "puzzles-progress-v1";

export interface ProgressStore {
  get: (puzzleId: string) => PuzzleProgress;
  set: (puzzleId: string, progress: PuzzleProgress) => void;
  /** Bumps on every write; a cheap snapshot for useSyncExternalStore. */
  readonly version: number;
  /** Notifies list views etc. when any record changes. */
  subscribe: (listener: () => void) => () => void;
}

export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createProgressStore(storage: KeyValue | null): ProgressStore {
  let all: Record<string, PuzzleProgress> = {};
  try {
    const raw = storage?.getItem(PROGRESS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") all = parsed as Record<string, PuzzleProgress>;
  } catch {
    all = {};
  }
  const listeners = new Set<() => void>();
  let version = 0;
  return {
    get: (id) => all[id] ?? {},
    get version() {
      return version;
    },
    set(id, progress) {
      all[id] = progress;
      version++;
      try {
        storage?.setItem(PROGRESS_KEY, JSON.stringify(all));
      } catch {
        /* storage full / private mode: progress is best-effort */
      }
      for (const l of listeners) l();
    },
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export function createMemoryStorage(): KeyValue {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

/** `localStorage` if usable in this browser, else null (private mode, sandboxed iframes...). */
export function safeLocalStorage(): KeyValue | null {
  try {
    const s = globalThis.localStorage;
    s.getItem(PROGRESS_KEY);
    return s;
  } catch {
    return null;
  }
}
