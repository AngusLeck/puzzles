import { useSyncExternalStore } from "react";

/**
 * Each puzzle has a shareable URL: .../#/<id>. Hash routing needs no server
 * config, which suits GitHub Pages. Ids are stable and spoiler-free, so
 * titles can change without breaking links.
 */
export function parseHash(hash: string): string | null {
  const id = decodeURIComponent(hash.replace(/^#\/?/, ""));
  return id || null;
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const get = () => parseHash(location.hash);

export function useHashRoute(): string | null {
  return useSyncExternalStore(subscribe, get, () => null);
}

export function navigateTo(id: string | null): void {
  if (id) location.hash = "#/" + encodeURIComponent(id);
  else location.hash = "";
}

/** Drop a dangling/unknown hash without adding a history entry. */
export function clearHashSilently(): void {
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}
