# Puzzles

A standalone tile-and-slot puzzle page. No build step, no dependencies — open
`index.html` in a browser, or host the folder on GitHub Pages.

Every puzzle is the same generic shape: a **prompt**, some **slots** arranged on
a grid, and **tiles** to fill them with (either a fixed set, or a letter
generator the player controls). Different puzzle types — cryptic crosswords,
connections, unscrambles — are just different compositions of those pieces.

## Files

- `index.html` — the whole app (UI, drag/snap engine, hints, storage).
- `puzzles.js` — the puzzle data, edited by hand. It assigns a JSON array to
  `window.PUZZLES`. (It's a `.js` wrapper around JSON only so the page also
  works from `file://`, where fetching a `.json` file is blocked.)

Player progress (solves, hints revealed, board state) is kept in
`localStorage` under `puzzles-progress-v1`.

## Puzzle schema

```jsonc
{
  "id": "cryptic-1",             // required, unique, stable. Keyed on for progress
                                 //   AND used as the shareable URL route (#/<id>),
                                 //   so keep it neutral/spoiler-free and don't rename it
  "title": "Mini Cryptic №1",    // shown in the list and puzzle header
  "subtitle": "optional blurb",  // shown on the list card
  "releaseDate": "2026-12-25",   // optional; puzzle is hidden until this local date
  "attribution": "RAD",          // optional author credit (list badge + "— RAD" under the prompt)
  "prompt": "ACROSS\n1. ...",    // plain text, newlines respected

  // --- tiles: provide one (or both) of these ---
  "tiles": [                     // fixed tiles the puzzle starts with
    { "id": "t01", "text": "NAVY" }
  ],
  "tileGenerator": {             // lets the player mint/remove letter tiles
    "type": "letters",           // shows an A–Z strip (desktop: also type; backspace removes)
    "letters": "AEIOU"           // optional subset; defaults to A–Z
  },

  // --- slots: positions are grid units, fractions allowed (for row gaps) ---
  "slots": [
    { "id": "c1", "x": 0, "y": 0,
      "label": "1",              // optional small corner label (crossword numbering)
      "centerLabel": "A" }       // optional large faded label filling the slot;
  ],                             //   visible until a tile covers it
  "slotGap": 8,                  // optional px between slots (default 8)
  "tileAspect": 2.4,             // optional width/height ratio (word tiles; default 1)
  "chainTiles": false,           // optional; tiles snapping side-by-side into draggable
                                 // words defaults to ON when there's a tileGenerator

  // --- checks: solved when ALL checks pass and every slot is filled ---
  "checks": [
    { "type": "slots",           // exact tile text per slot (case-insensitive;
      "answers": {               //  value may be a string or an array of accepted strings)
        "c1": "C", "c2": ["A", "Á"]
      }
    },
    { "type": "categories",      // each slot group must hold exactly one full
      "slotGroups": [["r1c1", "r1c2"]],   // category (any category ↔ any group)
      "categories": [
        { "label": "Shades of blue", "tiles": ["NAVY", "SKY"] }
      ]
    },
    { "type": "any" }            // passes as soon as every slot is filled, whatever
  ],                             //   the tiles (for open-ended / joke puzzles)

  // --- hints, grouped by size; players reveal them in file order per size ---
  //     each distinct `size` becomes its own reveal button. The ladder should
  //     guide, never hand over the answer: "definition" (just name/highlight the
  //     definition) → "wordplay" (name the indicators and their *type*, not the
  //     result) → "fodder" (highlight the words the indicators act on). Add a
  //     "bonus" size for a "try this variation of the same clue" nudge. Keep the
  //     puzzle's title/subtitle neutral too — don't echo the definition.
  "hints": [
    {
      "size": "definition",      // any label: "small" / "definition" / "bonus" / ...
      "text": "Shown to the player.",
      "highlight": {             // all optional
        "prompt": ["scattered"], // substrings of the prompt to mark
        "slots": ["c1", "c2"],   // slot ids to glow
        "tiles": ["KIDNEY"]      // tile ids OR tile texts to glow
      }
    }
  ]
}
```

Checks compose: a puzzle can mix `slots` and `categories` checks (or gain new
check types later) without the engine knowing anything about "crosswords" or
"connections".

**Crosswords** are just a `slots` puzzle where words share cells: give the two
crossing words a single slot at the intersection (one id, one letter) and both
"words" are satisfied by that one tile. Number the starting cells with `label`.
See the `carpenter-crossword` puzzle: one 10-letter Down crossing two Acrosses.

## Interactions

The whole screen is the play area — slots float in space and tiles can be
dragged anywhere. Tiles are heavy: they lag behind the pointer, slide across
each other with friction, keep a little momentum on release, and click into
slots with a snap.

- **Drag** tiles into slots; nearby slots highlight while dragging. Dropping on
  an occupied slot swaps the old tile out.
- **Chaining** (on by default when there's a `tileGenerator`): tiles dropped
  side-by-side snap into a word that drags as one piece; a chain dropped over a
  run of empty slots fills all of them.
- **Double-tap**: pops a placed tile out of its slot / detaches a tile from a chain.
- **Tile bank** (when a `tileGenerator` is present): roll the drawer up from the
  bottom edge and tap letters to mint tiles.
- **Select & type**: tap a slot to select it, then type — each letter drops a
  tile straight into the slot and the selection advances along the linear run
  (across or down). Tapping the same slot again toggles direction; arrows move
  the selection; backspace clears and steps back. (Only when tiles can be added.)
- Generated tiles are deleted by dropping them on the ✕ that appears while dragging.
- **Sound**: synthesized stone clacks for pick-up / snap / place / remove / solve,
  a roll for the bank, and a grainy grind while dragging (subtle across the board,
  deeper against other tiles). Toggle with the 🔊 button (persisted).
- **Theme**: the 🌗/☀️/🌙 button cycles Auto → Light → Dark (persisted); Auto
  follows the OS. Available on the list and in-puzzle.
- The puzzle auto-checks whenever every slot is filled: wrong shakes, right
  celebrates.
