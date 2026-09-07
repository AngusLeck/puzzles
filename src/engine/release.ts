import type { Puzzle } from "./types";

/** Local calendar date as YYYY-MM-DD: drops appear/disappear at each player's own midnight. */
export function todayLocal(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export function isReleased(p: Puzzle, today = todayLocal()): boolean {
  return !p.releaseDate || p.releaseDate <= today;
}

/** `expiryDate` is the last listed local date, inclusive. Lists only: links never rot. */
export function hasClosed(p: Puzzle, today = todayLocal()): boolean {
  return !!p.expiryDate && p.expiryDate < today;
}

export interface ListPartition {
  released: Puzzle[];
  upcoming: Puzzle[];
}

export function partitionForList(all: readonly Puzzle[], today = todayLocal()): ListPartition {
  const current = all.filter((p) => !hasClosed(p, today));
  return {
    released: current.filter((p) => isReleased(p, today)),
    upcoming: current
      .filter((p) => !isReleased(p, today))
      .sort((a, b) => (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "")),
  };
}
