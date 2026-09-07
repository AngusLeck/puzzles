# Puzzles

A tile-and-slot puzzle page for sharing cryptics, crosswords and connections
with friends. Deployed to GitHub Pages on every merge to `main`.

Every puzzle is the same generic shape: a **prompt**, some **slots** arranged on
a grid, and **tiles** to fill them with (either a fixed set, or a letter
generator the player controls). Different puzzle types are just different
compositions of those pieces; the engine never learns about "crosswords".

## Develop

```sh
yarn            # install
yarn dev        # http://localhost:5173
yarn check      # typecheck + lint + unit tests
yarn e2e        # Playwright smoke tests against a production build (run `yarn build` first)
yarn build      # dist/
```

Node 20+, Yarn 1. The original single-file implementation lives in
[`legacy/`](legacy/) as a reference for the intended look and feel; it is not
deployed.

## Adding a puzzle

Create `src/puzzles/data/<id>.ts`:

```ts
import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-18", // stable, spoiler-free, never renamed: it's the URL (#/cryptic-18) and the progress key
  title: "Neutral title",
  attribution: "AD",
  releaseDate: "2026-09-18", // optional; listed from this local date. Direct links always work.
  prompt: "The clue goes here. (5)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    // ...
  ],
  checks: [{ type: "slots", answers: { s1: "A", s2: "B" } }],
  hints: [
    { size: "definition", text: "...", highlight: { prompt: ["a substring"] } },
    { size: "wordplay", text: "...", highlight: { prompt: ["indicator"] } },
  ],
});
```

That's it: the file is picked up automatically (`src/puzzles/index.ts` globs the
directory), and `yarn test` validates it against the schema in
`src/puzzles/schema.ts`: unique ids, every referenced slot exists, every hint
highlight actually occurs in the prompt, dates are well-formed. A typo fails CI
rather than a friend's browser.

### Schema, briefly

| field                     | notes                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `id`, `title`, `subtitle` | id is the route and progress key; keep titles neutral (don't echo the definition)      |
| `releaseDate`             | listed from this local date, inclusive                                                 |
| `expiryDate`              | last listed local date, inclusive; the link keeps working forever                      |
| `attribution`             | list badge + "— X" under the prompt                                                    |
| `prompt`                  | plain text; newlines kept; `^{…}` / `_{…}` render as superscript / subscript           |
| `tiles`                   | fixed tiles `{ id, text }`, dealt loose below the grid                                 |
| `tileGenerator`           | `{ type: "letters", letters?: "AEIOU" }` shows the roll-up A–Z bank and enables typing |
| `slots`                   | `{ id, x, y, label?, centerLabel? }`; grid units, fractions allowed (row gaps)         |
| `slotGap`, `tileAspect`   | px between slots (8); tile width/height (1)                                            |
| `chainTiles`              | side-by-side tiles snap into a word; defaults to on when there's a generator           |
| `checks`                  | all must pass, and every slot must be filled                                           |
| `hints`                   | grouped by `size`; players reveal in file order per size                               |

Check kinds:

- `slots`: exact text per slot, case-insensitive; a value may be an array of accepted strings.
- `categories`: each `slotGroups[i]` must hold exactly one full category, any category ↔ any group.
- `any`: passes once every slot is filled (open-ended / joke puzzles).

**Crosswords** are a `slots` puzzle where words share cells: give crossing words
a single slot at the intersection. Number the starting cells with `label`.

New check kinds are one entry in `src/engine/checks.ts` (pass/fail + which
tiles are wrong); nothing else changes.

### Release mechanics

`releaseDate` / `expiryDate` bracket the window a puzzle is **on the list**.
Every puzzle is always reachable at `#/<id>`, before release and after its run,
so a weekend drop is `releaseDate` Saturday, `expiryDate` Sunday. Dates compare
against the _player's_ local date.

## Interactions (what the engine preserves)

The whole screen is the board. Tiles are heavy: they lag the pointer, resolve
overlaps by sliding around neighbours, keep a little momentum on a flick, and
click into slots with a snap.

- **Drag** tiles into slots; candidate slots highlight during the drag. Dropping on an occupied slot swaps the old tile out.
- **Chaining** (with a generator): tiles dropped side by side snap into a word that drags as one piece; a chain dropped over a run of empty slots fills them all.
- **Double-tap** pops a placed tile out / detaches a tile from a chain.
- **Tile bank**: roll the drawer up, tap to mint, or press-and-drag a tile straight out.
- **Select & type**: tap a slot, type; the selection advances along the run. Tap again to toggle across/down; arrows move; backspace clears and steps back. Tap a loose word to append to it.
- **Trash**: generated tiles are deleted by dropping them on the ✕ that appears while dragging.
- **Sound**: synthesised stone clacks and a speed-driven grind while dragging (Web Audio, no samples). 🔊 toggles, persisted.
- **Theme**: 🌗/☀️/🌙 cycles Auto → Light → Dark, persisted; defaults to Light.
- **Help modes**: 👼 ejects only wrong tiles on a mistake; 😈 clears the whole board.
- Auto-check when every slot is filled: wrong shakes and counts a mistake, right celebrates and freezes the solution (the rest of the board stays live).

Progress (solves, hints, mistakes, board state) is in `localStorage` under
`puzzles-progress-v1`, the same key and shape as before the rewrite, so nobody
loses anything on upgrade.

## Architecture

```
src/
  puzzles/      data/*.ts (one puzzle per file), schema.ts (zod, tests only), index.ts (glob + order)
  engine/       framework-free game model
    engine.ts   Engine: state, commands (pointer/typing/hints/reset), rAF step(), immutable Snapshot for the UI
    physics.ts  overlap resolution, friction, flick momentum
    layout.ts   grid fitting; checks.ts pluggable check kinds; grid.ts typing runs
    richtext.ts prompt markup + highlight segmentation; release.ts list windows; progress.ts persistence
  audio/        Sound: Web Audio synth driven by engine events
  ui/           React 19 components (chrome, panels, list) + Board.tsx (DOM renderer)
  state/        persisted preferences
  app/          hash router, theme, service wiring
e2e/            Playwright smoke tests
legacy/         the original single-file implementation (reference only)
```

The hot path bypasses React: `Board.tsx` runs a `requestAnimationFrame` loop
that calls `engine.step()` and writes tile transforms / z-order / drop-target
classes straight onto the DOM nodes. React only re-renders on discrete changes
(a tile placed, a hint revealed) via `useSyncExternalStore` on the engine's
snapshot. The engine has no DOM dependency and is exercised directly by the
Vitest suite (`src/engine/engine.test.ts`), including drag, chaining,
swapping, ejecting, persistence round-trips and category matching.
