import { useEffect, useSyncExternalStore } from "react";
import type { ThemePref } from "@/state/prefs";

const media = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;

function subscribeMedia(cb: () => void) {
  media?.addEventListener("change", cb);
  return () => media?.removeEventListener("change", cb);
}
const systemDark = () => !!media?.matches;

export type EffectiveTheme = "light" | "dark";

export function effectiveTheme(pref: ThemePref, dark: boolean): EffectiveTheme {
  return pref === "auto" ? (dark ? "dark" : "light") : pref;
}

/** Applies the theme to <html> (and the browser chrome colour) whenever the preference or OS changes. */
export function useApplyTheme(pref: ThemePref): EffectiveTheme {
  const dark = useSyncExternalStore(subscribeMedia, systemDark, () => false);
  const eff = effectiveTheme(pref, dark);
  useEffect(() => {
    document.documentElement.dataset.theme = eff;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", eff === "dark" ? "#211d16" : "#e8dec9");
  }, [eff]);
  return eff;
}

export function themeIcon(pref: ThemePref): string {
  return pref === "auto" ? "🌗" : pref === "light" ? "☀️" : "🌙";
}
