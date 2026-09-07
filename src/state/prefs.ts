import { useSyncExternalStore } from "react";
import type { KeyValue } from "@/engine/progress";
import { safeLocalStorage } from "@/engine/progress";

/**
 * Small persisted player preferences. Keys are unchanged from the original
 * page so nobody's theme / mute / prompt position resets on upgrade.
 */
export type ThemePref = "auto" | "light" | "dark";
export const THEME_KEY = "puzzles-theme";
export const MUTE_KEY = "puzzles-muted";
export const NOHELP_KEY = "puzzles-nohelp";
export const PROMPT_POS_KEY = "puzzles-prompt-pos";

/** Light by default, whatever the OS says: the board art is drawn for it. */
export const THEME_DEFAULT: ThemePref = "light";

export interface Prefs {
  theme: ThemePref;
  muted: boolean;
  noHelp: boolean;
  promptPos: { x: number; y: number } | null;
}

export interface PrefsStore {
  get: () => Prefs;
  set: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  subscribe: (listener: () => void) => () => void;
}

function readPrefs(s: KeyValue | null): Prefs {
  const theme = s?.getItem(THEME_KEY);
  let promptPos: Prefs["promptPos"] = null;
  try {
    const raw = s?.getItem(PROMPT_POS_KEY);
    const v: unknown = raw ? JSON.parse(raw) : null;
    if (v && typeof v === "object" && "x" in v && "y" in v) {
      const { x, y } = v;
      if (typeof x === "number" && typeof y === "number") promptPos = { x, y };
    }
  } catch {
    promptPos = null;
  }
  return {
    theme: theme === "auto" || theme === "dark" || theme === "light" ? theme : THEME_DEFAULT,
    muted: s?.getItem(MUTE_KEY) === "1",
    noHelp: s?.getItem(NOHELP_KEY) === "1",
    promptPos,
  };
}

export function createPrefsStore(storage: KeyValue | null = safeLocalStorage()): PrefsStore {
  let prefs = readPrefs(storage);
  const listeners = new Set<() => void>();
  const write = (key: string, value: string | null) => {
    try {
      if (value == null) storage?.removeItem(key);
      else storage?.setItem(key, value);
    } catch {
      /* best effort */
    }
  };
  return {
    get: () => prefs,
    set(key, value) {
      prefs = { ...prefs, [key]: value };
      switch (key) {
        case "theme":
          write(THEME_KEY, prefs.theme);
          break;
        case "muted":
          write(MUTE_KEY, prefs.muted ? "1" : "0");
          break;
        case "noHelp":
          write(NOHELP_KEY, prefs.noHelp ? "1" : "0");
          break;
        case "promptPos":
          write(PROMPT_POS_KEY, prefs.promptPos ? JSON.stringify(prefs.promptPos) : null);
          break;
      }
      for (const l of listeners) l();
    },
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export function usePrefs(store: PrefsStore): Prefs {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export const THEME_ORDER: readonly ThemePref[] = ["auto", "light", "dark"];
export function nextTheme(t: ThemePref): ThemePref {
  return THEME_ORDER[(THEME_ORDER.indexOf(t) + 1) % THEME_ORDER.length] ?? THEME_DEFAULT;
}
