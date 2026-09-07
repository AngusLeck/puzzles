import { describe, expect, it } from "vitest";
import { puzzles } from "./index";
import { puzzleSchema } from "./schema";

describe("puzzle data", () => {
  it("loads every puzzle", () => {
    expect(puzzles.length).toBeGreaterThanOrEqual(20);
  });

  it.each(puzzles.map((p) => [p.id, p] as const))("%s validates against the schema", (_id, p) => {
    const result = puzzleSchema.safeParse(p);
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues, null, 2)).toBe(
      true,
    );
  });

  it("has unique ids", () => {
    const ids = puzzles.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the legacy list order (cryptics, crosswords, connections)", () => {
    const ids = puzzles.map((p) => p.id);
    expect(ids.slice(0, 3)).toEqual(["cryptic-1", "cryptic-2", "cryptic-3"]);
    expect(ids.slice(-3)).toEqual(["crossword-1", "crossword-2", "connections-1"]);
  });

  it("every slot in a `slots` check has an answer (so puzzles are actually solvable)", () => {
    for (const p of puzzles) {
      for (const c of p.checks) {
        if (c.type !== "slots") continue;
        for (const s of p.slots)
          expect(c.answers[s.id], `${p.id}: slot ${s.id} has no answer`).toBeDefined();
      }
    }
  });
});
