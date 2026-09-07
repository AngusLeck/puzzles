import type { PuzzleInput } from "./schema";

/**
 * Author-facing helper: gives editor completion/type-checking for a puzzle
 * literal without pulling the zod schema into the runtime bundle. Full
 * validation (cross-references, dates, uniqueness) runs in `yarn test`, so a
 * typo fails CI, not a friend's browser.
 */
export function definePuzzle<const T extends PuzzleInput>(def: T): T {
  return def;
}
