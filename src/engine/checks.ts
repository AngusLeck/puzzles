import type { CategoriesCheck, Check } from "@/puzzles/schema";

/** What a check needs to know about the board: the text in each slot (null = empty). */
export interface BoardReader {
  textInSlot(slotId: string): string | null;
  tileIdInSlot(slotId: string): string | null;
}

export interface CategoryMatch {
  groupIndex: number;
  categoryIndex: number;
}

/**
 * A check kind knows how to (a) pass/fail a full board and (b) name the tiles
 * that are wrong, so they can be shaken loose. Adding a puzzle format = adding
 * an entry here; the engine never learns about "crosswords" or "connections".
 */
interface CheckKind<C extends Check> {
  passes(check: C, board: BoardReader): boolean;
  wrongTileIds(check: C, board: BoardReader): string[];
}

const norm = (s: string) => s.toUpperCase();
const acceptedList = (a: string | string[]) => (Array.isArray(a) ? a : [a]).map(norm);

const slotsKind: CheckKind<Extract<Check, { type: "slots" }>> = {
  passes(check, board) {
    return Object.entries(check.answers).every(([slotId, accepted]) => {
      const text = board.textInSlot(slotId);
      return text != null && acceptedList(accepted).includes(norm(text));
    });
  },
  wrongTileIds(check, board) {
    const wrong: string[] = [];
    for (const [slotId, accepted] of Object.entries(check.answers)) {
      const text = board.textInSlot(slotId);
      const tileId = board.tileIdInSlot(slotId);
      if (text == null || tileId == null) continue;
      if (!acceptedList(accepted).includes(norm(text))) wrong.push(tileId);
    }
    return wrong;
  },
};

const categoryKey = (tiles: readonly string[]) => tiles.map(norm).sort().join(" ");

/** Match each slot group to a distinct category; null if any group fails or is unfilled. */
export function matchCategories(
  check: CategoriesCheck,
  board: BoardReader,
): CategoryMatch[] | null {
  const remaining = check.categories.map((_, i) => i);
  const matches: CategoryMatch[] = [];
  for (let g = 0; g < check.slotGroups.length; g++) {
    const texts: string[] = [];
    for (const id of check.slotGroups[g] ?? []) {
      const t = board.textInSlot(id);
      if (t == null) return null;
      texts.push(t);
    }
    const k = categoryKey(texts);
    const found = remaining.find((ci) => categoryKey(check.categories[ci]?.tiles ?? []) === k);
    if (found === undefined) return null;
    remaining.splice(remaining.indexOf(found), 1);
    matches.push({ groupIndex: g, categoryIndex: found });
  }
  return matches;
}

const categoriesKind: CheckKind<CategoriesCheck> = {
  passes(check, board) {
    return matchCategories(check, board) != null;
  },
  wrongTileIds(check, board) {
    const cats = new Set(check.categories.map((c) => categoryKey(c.tiles)));
    const wrong: string[] = [];
    for (const group of check.slotGroups) {
      const texts: string[] = [];
      for (const id of group) {
        const t = board.textInSlot(id);
        if (t != null) texts.push(t);
      }
      if (texts.length !== group.length) continue;
      if (!cats.has(categoryKey(texts)))
        for (const id of group) {
          const tid = board.tileIdInSlot(id);
          if (tid) wrong.push(tid);
        }
    }
    return wrong;
  },
};

const anyKind: CheckKind<Extract<Check, { type: "any" }>> = {
  passes: () => true,
  wrongTileIds: () => [],
};

type KindMap = { [K in Check["type"]]: CheckKind<Extract<Check, { type: K }>> };
const kinds: KindMap = { slots: slotsKind, categories: categoriesKind, any: anyKind };

function kindFor<C extends Check>(check: C): CheckKind<C> {
  return kinds[check.type] as unknown as CheckKind<C>;
}

/** Solved when every check passes (callers also require every slot filled). */
export function evaluateChecks(checks: readonly Check[], board: BoardReader): boolean {
  if (!checks.length) return false;
  return checks.every((c) => kindFor(c).passes(c, board));
}

/** Union of tiles any check considers wrong. */
export function wrongTileIds(checks: readonly Check[], board: BoardReader): Set<string> {
  const out = new Set<string>();
  for (const c of checks) for (const id of kindFor(c).wrongTileIds(c, board)) out.add(id);
  return out;
}
