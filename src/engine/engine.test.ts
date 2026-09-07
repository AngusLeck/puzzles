import { beforeEach, describe, expect, it, vi } from "vitest";
import { Engine, DRAG_START_DIST, DOUBLE_TAP_MS } from "./engine";
import { createMemoryStorage, createProgressStore, type ProgressStore } from "./progress";
import type { EngineEvent, Puzzle } from "./types";
import cryptic1 from "@/puzzles/data/cryptic-1";
import connections1 from "@/puzzles/data/connections-1";
import crossword2 from "@/puzzles/data/crossword-2";

/** Deterministic LCG so tests don't depend on Math.random. */
function seeded(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface Harness {
  engine: Engine;
  events: EngineEvent[];
  progress: ProgressStore;
  clock: { t: number };
  /** Drag a tile from wherever it is to a board position (its top-left). */
  dragTileTo(tileId: string, x: number, y: number): void;
  /** Run `n` frames of the loop. */
  frames(n: number): void;
}

function harness(
  puzzle: Puzzle,
  opts: { progress?: ProgressStore; noHelp?: boolean; w?: number; h?: number } = {},
): Harness {
  const events: EngineEvent[] = [];
  const clock = { t: 1000 };
  const progress = opts.progress ?? createProgressStore(createMemoryStorage());
  const engine = new Engine(
    {
      puzzle,
      progress,
      random: seeded(7),
      now: () => clock.t,
      noHelp: () => !!opts.noHelp,
      onEvent: (e) => events.push(e),
    },
    opts.w ?? 400,
    opts.h ?? 800,
  );
  const frames = (n: number) => {
    for (let i = 0; i < n; i++) {
      clock.t += 16;
      engine.step(clock.t);
    }
  };
  const dragTileTo = (tileId: string, x: number, y: number) => {
    const tile = engine.tiles.get(tileId);
    if (!tile) throw new Error(`no tile ${tileId}`);
    const L = engine.layout;
    // Settle so tile.x/y reflect the unit anchor before pressing.
    frames(60);
    const px = tile.x + L.tileW / 2;
    const py = tile.y + L.tileH / 2;
    clock.t += DOUBLE_TAP_MS + 10; // never read as a double tap
    expect(engine.tilePointerDown(tileId, 1, px, py)).toBe("drag-armed");
    engine.pointerMove(1, px + DRAG_START_DIST + 2, py);
    frames(2);
    engine.pointerMove(1, x + L.tileW / 2, y + L.tileH / 2);
    frames(2);
    clock.t += 200; // long pause: no flick momentum
    engine.pointerUp(1);
    frames(2);
  };
  return { engine, events, progress, clock, dragTileTo, frames };
}

const types = (h: Harness) => h.events.map((e) => e.type);

describe("Engine: letter puzzle (cryptic-1)", () => {
  let h: Harness;
  beforeEach(() => {
    h = harness(cryptic1);
  });

  it("lays out one slot per definition and starts empty", () => {
    const snap = h.engine.getSnapshot();
    expect(snap.slots).toHaveLength(5);
    expect(snap.tiles).toHaveLength(0);
    expect(snap.solved).toBe(false);
    // slots sit on a row, evenly pitched
    const xs = snap.slots.map((s) => s.px);
    expect(xs[1]! - xs[0]!).toBeCloseTo(h.engine.layout.pitchX);
  });

  it("types letters into a selected slot, advancing along the run", () => {
    h.engine.selectSlot("s1");
    h.engine.addLetter("I", false);
    h.engine.addLetter("D", false);
    const snap = h.engine.getSnapshot();
    const filled = snap.slots.filter((s) => s.filled).map((s) => s.id);
    expect(filled).toEqual(["s1", "s2"]);
    expect(snap.slots.find((s) => s.id === "s3")?.selected).toBe(true);
    expect(snap.tiles.map((t) => t.text)).toEqual(["I", "D"]);
    expect(snap.tiles.every((t) => t.generated)).toBe(true);
  });

  it("solves when the right word is typed and fires a celebration", () => {
    h.engine.selectSlot("s1");
    for (const ch of "IDIOM") h.engine.addLetter(ch, false);
    const snap = h.engine.getSnapshot();
    expect(snap.solved).toBe(true);
    expect(snap.slots.every((s) => s.locked)).toBe(true);
    expect(snap.tiles.every((t) => t.locked)).toBe(true);
    expect(types(h)).toContain("solve");
    expect(types(h)).toContain("confetti");
    expect(h.progress.get("cryptic-1").solved).toBe(true);
  });

  it("counts a distinct wrong full board as one mistake and ejects only the wrong tiles", () => {
    h.engine.selectSlot("s1");
    for (const ch of "IDIOT") h.engine.addLetter(ch, false);
    const snap = h.engine.getSnapshot();
    expect(snap.solved).toBe(false);
    expect(snap.mistakes).toBe(1);
    expect(types(h)).toContain("bad");
    expect(types(h)).toContain("shake");
    const filled = snap.slots.filter((s) => s.filled).map((s) => s.id);
    expect(filled).toEqual(["s1", "s2", "s3", "s4"]); // the T popped out
    const loose = snap.tiles.filter((t) => !t.slotted);
    expect(loose.map((t) => t.text)).toEqual(["T"]);
  });

  it("in no-help mode, a mistake ejects every placed tile", () => {
    h = harness(cryptic1, { noHelp: true });
    h.engine.selectSlot("s1");
    for (const ch of "IDIOT") h.engine.addLetter(ch, false);
    const snap = h.engine.getSnapshot();
    expect(snap.slots.some((s) => s.filled)).toBe(false);
    expect(snap.tiles).toHaveLength(5);
  });

  it("backspace clears the selected slot, then steps back", () => {
    h.engine.selectSlot("s1");
    h.engine.addLetter("A", false);
    h.engine.addLetter("B", false); // selection now on s3
    h.engine.backspace(); // s3 empty -> step back to s2 and clear it
    let snap = h.engine.getSnapshot();
    expect(snap.slots.filter((s) => s.filled).map((s) => s.id)).toEqual(["s1"]);
    expect(snap.slots.find((s) => s.selected)?.id).toBe("s2");
    h.engine.backspace(); // s2 empty -> back to s1, clear
    snap = h.engine.getSnapshot();
    expect(snap.slots.some((s) => s.filled)).toBe(false);
    expect(snap.tiles).toHaveLength(0);
  });

  it("spawns loose letters when nothing is selected and removes the newest on backspace", () => {
    h.engine.addLetter("Q", false);
    h.engine.addLetter("R", false);
    expect(h.engine.getSnapshot().tiles.map((t) => t.text)).toEqual(["Q", "R"]);
    vi.useFakeTimers();
    h.engine.backspace();
    expect(h.engine.getSnapshot().tiles.find((t) => t.text === "R")?.dying).toBe(true);
    vi.runAllTimers();
    vi.useRealTimers();
    expect(h.engine.getSnapshot().tiles.map((t) => t.text)).toEqual(["Q"]);
  });

  it("drags a loose tile into a slot and snaps", () => {
    h.engine.addLetter("I", false);
    const tile = h.engine.getSnapshot().tiles[0]!;
    const slot = h.engine.slots.get("s3")!;
    h.dragTileTo(tile.id, slot.px + 3, slot.py - 2);
    const snap = h.engine.getSnapshot();
    expect(snap.slots.find((s) => s.id === "s3")?.filled).toBe(true);
    expect(types(h)).toEqual(expect.arrayContaining(["pick", "grindStart", "grindStop", "snap"]));
  });

  it("dropping onto an occupied slot swaps the old tile out", () => {
    h.engine.selectSlot("s1");
    h.engine.addLetter("A", false);
    h.engine.deselect();
    h.engine.addLetter("B", false);
    const b = h.engine.getSnapshot().tiles.find((t) => t.text === "B")!;
    const slot = h.engine.slots.get("s1")!;
    h.dragTileTo(b.id, slot.px, slot.py);
    const snap = h.engine.getSnapshot();
    expect(h.engine.tiles.get(slot.tileId!)?.text).toBe("B");
    expect(snap.tiles.find((t) => t.text === "A")?.slotted).toBe(false);
  });

  it("chains side-by-side tiles into one unit and drops a chain across a run of slots", () => {
    h.engine.addLetter("A", false);
    h.engine.addLetter("B", false);
    const [a, b] = h.engine.getSnapshot().tiles;
    const L = h.engine.layout;
    h.frames(60);
    const at = h.engine.tiles.get(a!.id)!;
    // Put B just to the right of A: should merge into one unit.
    h.dragTileTo(b!.id, at.x + L.tileW + 2, at.y);
    const unitIds = new Set([...h.engine.tiles.values()].map((t) => t.unitId));
    expect(unitIds.size).toBe(1);
    const unit = h.engine.units.get(h.engine.tiles.get(a!.id)!.unitId!)!;
    expect(unit.tileIds).toEqual([a!.id, b!.id]);
    // Now drop the chain onto s2..s3.
    const s2 = h.engine.slots.get("s2")!;
    h.dragTileTo(a!.id, s2.px, s2.py);
    expect(h.engine.slots.get("s2")!.tileId).toBe(a!.id);
    expect(h.engine.slots.get("s3")!.tileId).toBe(b!.id);
  });

  it("double-tap pops a tile out of its slot", () => {
    h.engine.selectSlot("s1");
    h.engine.addLetter("A", false);
    const tile = h.engine.getSnapshot().tiles[0]!;
    h.clock.t += 1000;
    expect(h.engine.tilePointerDown(tile.id, 1, 0, 0)).toBe("drag-armed");
    h.engine.pointerUp(1);
    h.clock.t += DOUBLE_TAP_MS / 2;
    expect(h.engine.tilePointerDown(tile.id, 1, 0, 0)).toBe("double-tap");
    expect(h.engine.getSnapshot().slots.find((s) => s.id === "s1")?.filled).toBe(false);
  });

  it("drops a generated tile on the trash to delete it", () => {
    vi.useFakeTimers();
    h.engine.addLetter("Z", false);
    const tile = h.engine.getSnapshot().tiles[0]!;
    h.frames(60);
    const t = h.engine.tiles.get(tile.id)!;
    h.clock.t += 1000;
    h.engine.tilePointerDown(tile.id, 1, t.x + 5, t.y + 5);
    h.engine.pointerMove(1, t.x + 50, t.y + 50);
    expect(h.engine.getSnapshot().dragRemovable).toBe(true);
    h.engine.setOverTrash(true);
    h.engine.pointerUp(1);
    expect(types(h)).toContain("remove");
    vi.runAllTimers();
    vi.useRealTimers();
    expect(h.engine.getSnapshot().tiles).toHaveLength(0);
  });

  it("persists the board and restores it (same record shape as the legacy page)", () => {
    h.engine.selectSlot("s1");
    h.engine.addLetter("I", false);
    h.engine.addLetter("D", false);
    h.engine.deselect();
    h.engine.addLetter("X", false);
    const saved = h.progress.get("cryptic-1");
    expect(saved.board?.slots).toEqual({ s1: "gen-1", s2: "gen-2" });
    expect(saved.board?.gen).toEqual([
      { id: "gen-1", text: "I" },
      { id: "gen-2", text: "D" },
      { id: "gen-3", text: "X" },
    ]);
    expect(saved.board?.units).toHaveLength(1);
    expect(saved.genCounter).toBe(4);

    const again = harness(cryptic1, { progress: h.progress });
    const snap = again.engine.getSnapshot();
    expect(snap.slots.filter((s) => s.filled).map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(snap.tiles.map((t) => t.text).sort()).toEqual(["D", "I", "X"]);
    again.engine.addLetter("Y", false);
    expect(again.engine.getSnapshot().tiles.some((t) => t.id === "gen-4")).toBe(true);
  });

  it("reveals hints in file order per size and remembers them", () => {
    expect(h.engine.hintSizes()).toEqual(["definition", "wordplay", "fodder"]);
    expect(h.engine.hintsRemaining("definition")).toBe(1);
    const hint = h.engine.revealNextHint("definition");
    expect(hint?.text).toContain("definition");
    expect(h.engine.hintsRemaining("definition")).toBe(0);
    expect(h.engine.revealNextHint("definition")).toBeNull();
    const snap = h.engine.getSnapshot();
    expect(snap.promptMarks).toEqual(["as they say"]);
    expect(snap.activeHint).toBe(hint);
    expect(h.progress.get("cryptic-1").hints).toEqual([0]);
    h.engine.clearHighlights();
    expect(h.engine.getSnapshot().promptMarks).toEqual([]);
  });

  it("reset clears tiles and the solved lock but keeps hints/mistakes", () => {
    h.engine.revealNextHint("definition");
    h.engine.selectSlot("s1");
    for (const ch of "IDIOT") h.engine.addLetter(ch, false);
    expect(h.engine.getSnapshot().mistakes).toBe(1);
    h.engine.reset();
    const snap = h.engine.getSnapshot();
    expect(snap.tiles).toHaveLength(0);
    expect(snap.mistakes).toBe(1);
    expect(snap.revealedHints).toEqual([0]);
    expect(h.progress.get("cryptic-1").board?.gen).toEqual([]);
  });

  it("keeps loose z-indexes compact under the chrome however many times tiles are lifted", () => {
    for (let i = 0; i < 40; i++) h.engine.addLetter("A", false);
    const ids = h.engine.getSnapshot().tiles.map((t) => t.id);
    for (let round = 0; round < 15; round++)
      for (const id of ids) {
        const t = h.engine.tiles.get(id)!;
        h.clock.t += 1000;
        h.engine.tilePointerDown(id, 1, t.x + 2, t.y + 2);
        h.engine.pointerMove(1, t.x + 40, t.y + 40);
        h.clock.t += 200;
        h.engine.pointerUp(1);
      }
    const zs = [...h.engine.tiles.values()].map((t) => t.z);
    expect(Math.max(...zs)).toBeLessThan(500);
    // Units (tiles may have chained) still have distinct z's: order is preserved, only compacted.
    const unitZ = [...h.engine.units.values()].map((u) => h.engine.tiles.get(u.tileIds[0]!)!.z);
    expect(new Set(unitZ).size).toBe(unitZ.length);
  });

  it("places restored tiles at their targets on the first measured resize", () => {
    // Play a move so there is a saved board, then reload it at a different size.
    h.engine.addLetter("A", false);
    h.frames(60);
    const reloaded = new Engine({
      puzzle: cryptic1,
      progress: h.progress,
      random: seeded(7),
      now: () => h.clock.t,
      onEvent: () => {},
    });
    reloaded.resize(800, 900);
    for (const tile of reloaded.tiles.values()) {
      const unit = tile.unitId != null ? reloaded.units.get(tile.unitId) : undefined;
      const slot = tile.slotId ? [...reloaded.slots.values()].find((s) => s.id === tile.slotId) : undefined;
      if (slot) {
        expect(tile.x).toBeCloseTo(slot.px, 5);
        expect(tile.y).toBeCloseTo(slot.py, 5);
      } else if (unit) {
        expect(tile.y).toBeCloseTo(unit.ay, 5);
      }
    }
  });

  it("keeps loose tiles in proportion on resize", () => {
    h.engine.addLetter("A", false);
    const u = [...h.engine.units.values()][0]!;
    const fx = u.ax / h.engine.layout.boardW;
    h.engine.resize(800, 800);
    expect(u.ax / 800).toBeCloseTo(fx, 1);
    expect(h.engine.layout.boardW).toBe(800);
  });
});

describe("Engine: crossword typing direction", () => {
  it("picks across first, toggles to down on re-tap, and walks with arrows", () => {
    const h = harness(crossword2);
    h.engine.selectSlot("c0r2"); // intersection: has both an across and a down run
    let snap = h.engine.getSnapshot();
    const inRun = snap.slots.filter((s) => s.inRun).map((s) => s.id);
    expect(inRun).toEqual(expect.arrayContaining(["c1r2", "c2r2", "c3r2"]));
    expect(inRun).not.toContain("c0r1");
    h.engine.selectSlot("c0r2"); // same slot again: toggle to down
    snap = h.engine.getSnapshot();
    expect(snap.slots.filter((s) => s.inRun).map((s) => s.id)).toContain("c0r1");
    h.engine.moveSelection("v", -1);
    expect(h.engine.getSnapshot().slots.find((s) => s.selected)?.id).toBe("c0r1");
  });
});

describe("Engine: fixed tiles + categories (connections-1)", () => {
  it("deals every fixed tile loose into free space: clear of slots and of each other", () => {
    const h = harness(connections1, { w: 1200, h: 800 });
    const snap = h.engine.getSnapshot();
    expect(snap.tiles).toHaveLength(16);
    expect(snap.tiles.every((t) => !t.generated && !t.slotted)).toBe(true);
    expect(h.engine.canType).toBe(false);
    const L = h.engine.layout;
    const rects = [...h.engine.units.values()].map((u) => ({
      x: u.ax,
      y: u.ay,
      w: L.tileW,
      h: L.tileH,
    }));
    const overlaps = (a: (typeof rects)[0], b: (typeof rects)[0]) =>
      a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) expect(overlaps(rects[i]!, rects[j]!)).toBe(false);
    for (const r of rects)
      for (const s of h.engine.slots.values())
        expect(overlaps(r, { x: s.px, y: s.py, w: L.tileW, h: L.tileH })).toBe(false);
    for (const r of rects) expect(r.y).toBeGreaterThanOrEqual(66);
  });

  it("defers the deal until the view reports a real board size", () => {
    const progress = createProgressStore(createMemoryStorage());
    const engine = new Engine({ puzzle: connections1, progress, random: seeded(3) });
    expect(engine.getSnapshot().tiles).toHaveLength(0);
    engine.resize(1200, 800);
    expect(engine.getSnapshot().tiles).toHaveLength(16);
  });

  it("solves when each row holds a complete category (any order) and reports backdrops", () => {
    const h = harness(connections1, { w: 1200, h: 800 });
    const check = connections1.checks[0]!;
    if (check.type !== "categories") throw new Error("expected categories check");
    // Put categories in rows in a *different* order to how they're listed.
    const order = [2, 0, 3, 1];
    const byText = new Map([...h.engine.tiles.values()].map((t) => [t.text, t.id]));
    order.forEach((catIdx, row) => {
      const cat = check.categories[catIdx]!;
      cat.tiles.forEach((text, col) => {
        const slot = h.engine.slots.get(check.slotGroups[row]![col]!)!;
        h.dragTileTo(byText.get(text)!, slot.px, slot.py);
      });
    });
    const snap = h.engine.getSnapshot();
    expect(snap.solved).toBe(true);
    expect(snap.categoryBackdrops.map((b) => b.categoryIndex)).toEqual(order);
    expect(snap.categoryBackdrops[0]?.label).toBe("Organs");
  });

  it("shakes loose every tile of a wrong group only", () => {
    const h = harness(connections1, { w: 1200, h: 800 });
    const check = connections1.checks[0]!;
    if (check.type !== "categories") throw new Error("expected categories check");
    const byText = new Map([...h.engine.tiles.values()].map((t) => [t.text, t.id]));
    // Rows 0-2 right; row 3 swaps one tile with row 2 -> both rows wrong.
    const rows = [
      check.categories[0]!.tiles,
      check.categories[1]!.tiles,
      ["HEART", "LIVER", "BRAIN", "SPIT"],
      ["BRIDGE", "SNAP", "HEARTS", "LUNG"],
    ];
    rows.forEach((texts, row) =>
      texts.forEach((text, col) => {
        const slot = h.engine.slots.get(check.slotGroups[row]![col]!)!;
        h.dragTileTo(byText.get(text)!, slot.px, slot.py);
      }),
    );
    const snap = h.engine.getSnapshot();
    expect(snap.solved).toBe(false);
    expect(snap.mistakes).toBe(1);
    const slotted = snap.tiles
      .filter((t) => t.slotted)
      .map((t) => t.text)
      .sort();
    expect(slotted).toEqual([...check.categories[0]!.tiles, ...check.categories[1]!.tiles].sort());
  });
});
