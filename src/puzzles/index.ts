import type { PuzzleDef } from "./schema";

// Attribution key: AD = default (unattributed), RAD / RD / AP / APD as marked.
//
// One module per puzzle. Add a puzzle by dropping a new file in ./data — this
// glob picks it up, and `yarn test` validates it against the schema (ids
// unique, every referenced slot exists, hint highlights actually occur in the
// prompt...). Order on the list is the order below: newest cryptics first is
// *not* the rule — the list is grouped by kind, as it always was.
const modules = import.meta.glob<{ default: PuzzleDef }>("./data/*.ts", { eager: true });

const ORDER = ["cryptic", "crossword", "connections"];
function rank(id: string): [number, number] {
  const [kind = "", n = "0"] = id.split(/-(?=\d+$)/);
  const k = ORDER.indexOf(kind);
  return [k < 0 ? ORDER.length : k, Number(n)];
}

export const puzzles: readonly PuzzleDef[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => {
    const [ka, na] = rank(a.id),
      [kb, nb] = rank(b.id);
    return ka - kb || na - nb;
  });

export const puzzleById = new Map(puzzles.map((p) => [p.id, p]));
export type { PuzzleDef } from "./schema";
