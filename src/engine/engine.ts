import type { Check, Hint } from "@/puzzles/schema";
import {
  evaluateChecks,
  matchCategories,
  wrongTileIds,
  type BoardReader,
  type CategoryMatch,
} from "./checks";
import { SlotGrid } from "./grid";
import { centerLabelFontSize, clamp, computeLayout, slotPosition, tileFontSize } from "./layout";
import {
  CHAIN_GAP,
  clampUnit,
  clampUnits,
  flickVelocity,
  integrate,
  separateUnits,
  tileOffsetInUnit,
  unitWidth,
} from "./physics";
import type { ProgressStore } from "./progress";
import type {
  DragState,
  EngineEvent,
  Layout,
  PendingPress,
  Puzzle,
  SavedBoard,
  SlotState,
  TileState,
  TypeDir,
  UnitState,
  Vec,
} from "./types";

export const DRAG_START_DIST = 6;
export const DOUBLE_TAP_MS = 320;
/** z-index for tiles resting in slots: always below loose tiles. */
const SLOT_Z = 2;
/** Loose tiles live in 10..MAX_LOOSE_Z, under the floating chrome (550+). */
const MAX_LOOSE_Z = 400;
/** A dragged unit rides above the clue and tile bank, under the trash target (900). */
export const DRAG_Z = 850;

export interface EngineOptions {
  puzzle: Puzzle;
  progress: ProgressStore;
  /** Injectable for deterministic tests. */
  random?: () => number;
  now?: () => number;
  /** "No help" mode: any mistake ejects every placed tile, right or wrong. Read at mistake time. */
  noHelp?: () => boolean;
  /**
   * Board-space band (top/bottom of tile tops) that randomly placed letters
   * should stay inside, so they land clear of the clue panel and tile bank.
   * The view owns those elements, so it supplies the numbers.
   */
  spawnBounds?: () => { top: number; bottom: number } | null;
  onEvent?: (e: EngineEvent) => void;
}

/* ------------------------------------------------------------------ views */
/** Discrete, immutable-per-version view of the board for the UI layer. */
export interface TileView {
  id: string;
  text: string;
  generated: boolean;
  slotted: boolean;
  locked: boolean;
  dying: boolean;
  lifted: boolean;
  selected: boolean;
  glow: boolean;
  fontSize: number;
}
export interface SlotView {
  id: string;
  label: string | undefined;
  centerLabel: string | undefined;
  centerLabelFontSize: number;
  px: number;
  py: number;
  filled: boolean;
  selected: boolean;
  inRun: boolean;
  glow: boolean;
  locked: boolean;
}
export interface CategoryBackdrop {
  x: number;
  y: number;
  w: number;
  h: number;
  categoryIndex: number;
  label: string;
}
export interface Snapshot {
  puzzle: Puzzle;
  layout: Layout;
  tiles: TileView[];
  slots: SlotView[];
  solved: boolean;
  solvedEver: boolean;
  mistakes: number;
  revealedHints: number[];
  hasSelection: boolean;
  dragging: boolean;
  dragRemovable: boolean;
  promptMarks: string[];
  activeHint: Hint | null;
  promptCollapsed: boolean;
  bankOpen: boolean;
  /** Coloured row backdrops + solved chips for category puzzles, once solved. */
  categoryBackdrops: CategoryBackdrop[];
}

/* ----------------------------------------------------------------- engine */
export class Engine {
  readonly puzzle: Puzzle;
  layout: Layout;
  readonly tiles = new Map<string, TileState>();
  readonly units = new Map<number, UnitState>();
  readonly slots = new Map<string, SlotState>();
  /** Slots a drag would drop into right now (refreshed each frame). */
  readonly targetSlotIds = new Set<string>();

  private grid: SlotGrid;
  private readonly progress: ProgressStore;
  private readonly random: () => number;
  private readonly clock: () => number;
  private readonly noHelp: () => boolean;
  private readonly spawnBoundsProvider: () => { top: number; bottom: number } | null;
  private readonly onEvent: (e: EngineEvent) => void;

  private unitSeq = 1;
  private zSeq = 10;
  private genCounter = 1;
  private drag: DragState | null = null;
  private pending: PendingPress | null = null;
  private solved = false;
  private solvedEver = false;
  private mistakes = 0;
  private revealedHints: number[] = [];
  private lastCheckSignature: string | null = null;
  private selectedSlotId: string | null = null;
  private selectedUnitId: number | null = null;
  private typeDir: TypeDir = "h";
  private glowSlots = new Set<string>();
  private glowTiles = new Set<string>();
  private promptMarks: string[] = [];
  private activeHint: Hint | null = null;
  private promptCollapsed = false;
  private bankOpen = false;
  /** Last known pointer position over the board (typed letters land near it). */
  pointer: Vec | null = null;

  private version = 0;
  private snapshot: Snapshot | null = null;
  private listeners = new Set<() => void>();

  /** True until the view reports a real board size; fixed tiles are dealt then, into measured free space. */
  private pendingDeal = false;

  /** Restored boards snap into place on the first measured resize instead of easing in. */
  private settleOnResize = false;

  constructor(opts: EngineOptions, boardW?: number, boardH?: number) {
    this.puzzle = opts.puzzle;
    this.progress = opts.progress;
    this.random = opts.random ?? Math.random;
    this.clock = opts.now ?? (() => performance.now());
    this.noHelp = opts.noHelp ?? (() => false);
    this.spawnBoundsProvider = opts.spawnBounds ?? (() => null);
    this.onEvent = opts.onEvent ?? (() => {});
    this.layout = computeLayout(this.puzzle, boardW ?? 390, boardH ?? 700);

    for (const def of this.puzzle.slots) {
      const { px, py } = slotPosition(this.layout, def.x, def.y);
      this.slots.set(def.id, { id: def.id, def, px, py, tileId: null, locked: false });
    }
    this.grid = new SlotGrid(this.slots.values());

    const saved = this.progress.get(this.puzzle.id);
    this.solvedEver = !!saved.solved;
    this.revealedHints = Array.isArray(saved.hints) ? [...saved.hints] : [];
    this.genCounter = saved.genCounter ?? 1;
    this.mistakes = saved.mistakes ?? 0;
    if (saved.board) {
      this.restoreBoard(saved.board);
      this.settleOnResize = true;
    }
    else if (boardW != null && boardH != null) this.dealFreshBoard();
    else this.pendingDeal = true;
    this.maybeCheckSolution({ quiet: true });
    this.invalidate();
  }

  /* ------------------------------------------------------------ pub/sub */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  private invalidate(): void {
    this.version++;
    this.snapshot = null;
    for (const l of this.listeners) l();
  }

  private emit(e: EngineEvent): void {
    this.onEvent(e);
  }

  getSnapshot = (): Snapshot => {
    if (this.snapshot) return this.snapshot;
    const runIds = new Set<string>();
    const sel = this.selectedSlotId ? this.slots.get(this.selectedSlotId) : null;
    if (sel) for (const s of this.grid.run(sel, this.typeDir)) runIds.add(s.id);
    const L = this.layout;
    const draggedUnit = this.drag?.unitId ?? null;
    this.snapshot = {
      puzzle: this.puzzle,
      layout: L,
      tiles: [...this.tiles.values()].map((t) => ({
        id: t.id,
        text: t.text,
        generated: t.generated,
        slotted: t.slotId != null,
        locked: t.locked,
        dying: t.dying,
        lifted: draggedUnit != null && t.unitId === draggedUnit,
        selected: this.selectedUnitId != null && t.unitId === this.selectedUnitId,
        glow: this.glowTiles.has(t.id),
        fontSize: tileFontSize(L, t.text),
      })),
      slots: [...this.slots.values()].map((s) => ({
        id: s.id,
        label: s.def.label != null ? String(s.def.label) : undefined,
        centerLabel: s.def.centerLabel != null ? String(s.def.centerLabel) : undefined,
        centerLabelFontSize: centerLabelFontSize(L, String(s.def.centerLabel ?? "")),
        px: s.px,
        py: s.py,
        filled: s.tileId != null,
        selected: s.id === this.selectedSlotId,
        inRun: runIds.has(s.id) && s.id !== this.selectedSlotId,
        glow: this.glowSlots.has(s.id),
        locked: s.locked,
      })),
      solved: this.solved,
      solvedEver: this.solvedEver,
      mistakes: this.mistakes,
      revealedHints: [...this.revealedHints],
      hasSelection: this.selectedSlotId != null || this.selectedUnitId != null,
      dragging: this.drag != null,
      dragRemovable: !!this.drag?.removable,
      promptMarks: [...this.promptMarks],
      activeHint: this.activeHint,
      promptCollapsed: this.promptCollapsed,
      bankOpen: this.bankOpen,
      categoryBackdrops: this.solved ? this.computeCategoryBackdrops() : [],
    };
    return this.snapshot;
  };

  /* ------------------------------------------------------------ layout */
  resize(boardW: number, boardH: number): void {
    if (boardW <= 0 || boardH <= 0) return;
    const old = this.layout;
    if (old.boardW === boardW && old.boardH === boardH) {
      if (this.pendingDeal) this.dealPending();
      if (this.settleOnResize) {
        this.settleOnResize = false;
        this.settleTiles();
      }
      return;
    }
    const fractions = new Map<number, Vec>();
    for (const u of this.units.values())
      fractions.set(u.id, { x: u.ax / old.boardW, y: u.ay / old.boardH });
    this.applyLayout(computeLayout(this.puzzle, boardW, boardH));
    for (const u of this.units.values()) {
      const f = fractions.get(u.id);
      if (f) {
        u.ax = f.x * boardW;
        u.ay = f.y * boardH;
      }
    }
    clampUnits(this.units.values(), this.layout);
    if (this.pendingDeal) this.dealPending();
    // The board is measured after construction, so the first real size would
    // otherwise make restored tiles ease in from their placeholder positions.
    if (this.settleOnResize) {
      this.settleOnResize = false;
      this.settleTiles();
    }
    this.invalidate();
  }

  private dealPending(): void {
    this.pendingDeal = false;
    this.dealFreshBoard();
    this.maybeCheckSolution({ quiet: true });
  }

  private applyLayout(L: Layout): void {
    this.layout = L;
    for (const s of this.slots.values()) {
      const p = slotPosition(L, s.def.x, s.def.y);
      s.px = p.px;
      s.py = p.py;
    }
  }

  /* ------------------------------------------------------ tiles & units */
  private createTile(id: string, text: string, generated: boolean): TileState {
    const tile: TileState = {
      id,
      text,
      generated,
      x: 0,
      y: 0,
      s: 1,
      r: 0,
      rot: (this.random() - 0.5) * 5,
      z: SLOT_Z,
      slotId: null,
      unitId: null,
      locked: false,
      dying: false,
      lastTap: 0,
      hopAt: 0,
      pulseAt: 0,
      snapAt: 0,
    };
    this.tiles.set(id, tile);
    return tile;
  }

  private createUnit(tileIds: string[], ax: number, ay: number): UnitState {
    const unit: UnitState = { id: this.unitSeq++, tileIds: [...tileIds], ax, ay, vx: 0, vy: 0 };
    clampUnit(unit, this.layout);
    this.units.set(unit.id, unit);
    for (const tid of tileIds) {
      const t = this.tiles.get(tid);
      if (t) {
        t.unitId = unit.id;
        t.slotId = null;
      }
    }
    return unit;
  }

  private bringUnitToFront(u: UnitState): void {
    if (this.zSeq >= MAX_LOOSE_Z) this.compactZ();
    this.zSeq += 1;
    for (const tid of u.tileIds) {
      const t = this.tiles.get(tid);
      if (t) t.z = this.zSeq;
    }
  }

  /** Reassign loose tiles' z-indexes 10.. in their current order so they never climb into the chrome. */
  private compactZ(): void {
    const loose = [...this.tiles.values()].filter((t) => !t.slotId).sort((a, b) => a.z - b.z);
    let z = 10;
    let last = -1;
    for (const t of loose) {
      if (t.z !== last) {
        last = t.z;
        z++;
      }
      t.z = z;
    }
    this.zSeq = z;
  }

  /** The unit under the pointer, if any. Its tiles render at DRAG_Z, above the bank and clue. */
  get draggedUnitId(): number | null {
    return this.drag?.unitId ?? null;
  }

  private dealFreshBoard(): void {
    const defs = [...(this.puzzle.tiles ?? [])];
    for (let i = defs.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      const a = defs[i];
      const b = defs[j];
      if (a && b) {
        defs[i] = b;
        defs[j] = a;
      }
    }
    const now = this.clock();
    defs.forEach((def, index) => {
      const tile = this.createTile(def.id, def.text, false);
      const spot = this.freeSpot();
      const unit = this.createUnit([tile.id], spot.x, spot.y);
      tile.x = spot.x;
      tile.y = spot.y;
      tile.s = 0.3;
      tile.pulseAt = now + index * 22;
      this.bringUnitToFront(unit);
    });
  }

  private restoreBoard(saved: SavedBoard): void {
    const L = this.layout;
    for (const def of this.puzzle.tiles ?? []) this.createTile(def.id, def.text, false);
    for (const gen of saved.gen ?? []) this.createTile(gen.id, gen.text, true);
    for (const [slotId, tileId] of Object.entries(saved.slots ?? {})) {
      const slot = this.slots.get(slotId);
      const tile = this.tiles.get(tileId);
      if (!slot || !tile || slot.tileId || tile.slotId) continue;
      slot.tileId = tile.id;
      tile.slotId = slot.id;
      tile.x = slot.px;
      tile.y = slot.py;
      tile.z = SLOT_Z;
    }
    for (const su of saved.units ?? []) {
      const tileIds = (su.tiles ?? []).filter((tid) => {
        const t = this.tiles.get(tid);
        return t && !t.slotId && !t.unitId;
      });
      if (!tileIds.length) continue;
      const unit = this.createUnit(tileIds, (su.nx || 0) * L.boardW, (su.ny || 0) * L.boardH);
      unit.tileIds.forEach((tid, i) => {
        const t = this.tiles.get(tid);
        if (t) {
          t.x = unit.ax + tileOffsetInUnit(i, L);
          t.y = unit.ay;
        }
      });
      this.bringUnitToFront(unit);
    }
    for (const tile of this.tiles.values()) {
      if (tile.slotId || tile.unitId) continue;
      const spot = this.freeSpot();
      this.createUnit([tile.id], spot.x, spot.y);
      tile.x = spot.x;
      tile.y = spot.y;
    }
  }

  private save(): void {
    const L = this.layout;
    const board: SavedBoard = { gen: [], slots: {}, units: [] };
    for (const t of this.tiles.values())
      if (t.generated && !t.dying) board.gen.push({ id: t.id, text: t.text });
    for (const s of this.slots.values()) {
      if (!s.tileId) continue;
      const t = this.tiles.get(s.tileId);
      if (t && !t.dying) board.slots[s.id] = s.tileId;
    }
    for (const u of this.units.values()) {
      const alive = u.tileIds.filter((tid) => !this.tiles.get(tid)?.dying);
      if (!alive.length) continue;
      board.units.push({ tiles: alive, nx: u.ax / L.boardW, ny: u.ay / L.boardH });
    }
    this.progress.set(this.puzzle.id, {
      solved: this.solvedEver,
      hints: this.revealedHints,
      genCounter: this.genCounter,
      mistakes: this.mistakes,
      board,
    });
  }

  /* -------------------------------------------------------- frame loop */
  /**
   * Advance one animation frame: settle physics, ease tiles toward their
   * targets. Continuous state (tile x/y/s/r/z) is read straight off `tiles`
   * by the renderer; nothing here touches the discrete snapshot.
   */
  step(now: number): void {
    const L = this.layout;
    integrate(this.units.values());
    const unitList = [...this.units.values()];
    separateUnits(unitList, L, this.drag?.unitId ?? null);
    clampUnits(unitList, L);
    this.updateSlotTargets();

    if (this.drag) {
      const du = this.units.get(this.drag.unitId);
      if (du) {
        const dx = du.ax - this.drag.lastAx;
        const dy = du.ay - this.drag.lastAy;
        this.drag.lastAx = du.ax;
        this.drag.lastAy = du.ay;
        const rw = unitWidth(du, L);
        let contact = false;
        for (const other of this.tiles.values()) {
          // slotted tiles are inset: nothing to grind against
          if (other.dying || other.unitId === du.id || other.slotId) continue;
          const ox = Math.min(du.ax + rw, other.x + L.tileW) - Math.max(du.ax, other.x);
          const oy = Math.min(du.ay + L.tileH, other.y + L.tileH) - Math.max(du.ay, other.y);
          if (ox > -4 && oy > -4) {
            contact = true;
            break;
          }
        }
        this.emit({ type: "grind", speed: Math.hypot(dx, dy), contact });
      }
    }

    for (const tile of this.tiles.values()) {
      const isDragged = !!this.drag && !tile.slotId && tile.unitId === this.drag.unitId;
      const { x: targetX, y: targetY, r: targetRot, s: targetScale } = this.tileTarget(
        tile,
        isDragged,
      );
      const ease = isDragged ? 0.4 : 0.19; // heavy lag
      tile.x += (targetX - tile.x) * ease;
      tile.y += (targetY - tile.y) * ease;
      tile.s += (targetScale - tile.s) * (tile.dying ? 0.35 : 0.24);
      tile.r += (targetRot - tile.r) * 0.2;
      if (tile.hopAt && now - tile.hopAt >= 380) tile.hopAt = 0;
      if (tile.pulseAt && now - tile.pulseAt >= 210) tile.pulseAt = 0;
      if (tile.snapAt && now - tile.snapAt >= 230) tile.snapAt = 0;
    }
  }

  /** Where a tile wants to be right now, before any transient hop/pulse offsets. */
  private tileTarget(
    tile: TileState,
    isDragged: boolean,
  ): { x: number; y: number; r: number; s: number } {
    const L = this.layout;
    const slot = tile.slotId ? this.slots.get(tile.slotId) : undefined;
    const unit = tile.unitId != null ? this.units.get(tile.unitId) : undefined;
    const scale = tile.dying ? 0 : 1;
    if (slot) return { x: slot.px, y: slot.py, r: 0, s: scale };
    if (unit) {
      const idx = unit.tileIds.indexOf(tile.id);
      return {
        x: unit.ax + tileOffsetInUnit(idx, L),
        y: unit.ay,
        r: isDragged ? 0 : tile.rot,
        s: isDragged ? 1.12 : scale,
      };
    }
    return { x: tile.x, y: tile.y, r: 0, s: scale };
  }

  /** Place every tile exactly at its target, so a restored board appears in place. */
  private settleTiles(): void {
    for (const tile of this.tiles.values()) {
      const t = this.tileTarget(tile, false);
      tile.x = t.x;
      tile.y = t.y;
      tile.r = t.r;
    }
  }

  /** Transient offsets layered on top of the eased position (hop / pulse / snap wobble). */
  static tileTransform(
    tile: TileState,
    now: number,
    L: Layout,
  ): { x: number; y: number; r: number; s: number } {
    let hop = 0;
    let pulse = 0;
    let snap = 0;
    if (tile.hopAt) {
      const p = (now - tile.hopAt) / 380;
      if (p > 0 && p < 1) hop = -Math.sin(p * Math.PI) * L.tileH * 0.3;
    }
    if (tile.pulseAt) {
      const p = (now - tile.pulseAt) / 210;
      if (p > 0 && p < 1) pulse = Math.sin(p * Math.PI) * 0.11;
    }
    if (tile.snapAt) {
      const p = (now - tile.snapAt) / 230;
      if (p > 0 && p < 1) snap = -0.17 * (1 - p) * Math.cos(p * Math.PI * 3);
    }
    return { x: tile.x, y: tile.y + hop, r: tile.r, s: tile.s + pulse + snap };
  }

  private updateSlotTargets(): void {
    this.targetSlotIds.clear();
    if (this.drag) {
      const unit = this.units.get(this.drag.unitId);
      const mapping = unit ? this.computeSlotMapping(unit) : null;
      if (mapping) for (const [, slot] of mapping) this.targetSlotIds.add(slot.id);
    }
  }

  /* ----------------------------------------------------------- pointer */
  /** Pointer down on a tile. Coordinates are board px. */
  tilePointerDown(
    tileId: string,
    pointerId: number,
    bx: number,
    by: number,
  ): "drag-armed" | "double-tap" | "ignored" {
    const tile = this.tiles.get(tileId);
    if (!tile || tile.locked || tile.dying || this.drag) return "ignored";
    this.emit({ type: "interaction" });
    const now = this.clock();
    if (now - tile.lastTap < DOUBLE_TAP_MS) {
      tile.lastTap = 0;
      this.handleDoubleTap(tile);
      return "double-tap";
    }
    tile.lastTap = now;
    this.pending = { tileId, pointerId, startX: bx, startY: by };
    return "drag-armed";
  }

  pointerMove(pointerId: number, bx: number, by: number): void {
    if (this.pending && this.pending.pointerId === pointerId && !this.drag) {
      if (Math.hypot(bx - this.pending.startX, by - this.pending.startY) > DRAG_START_DIST)
        this.beginDrag(this.pending);
    }
    if (!this.drag || this.drag.pointerId !== pointerId) return;
    const unit = this.units.get(this.drag.unitId);
    if (!unit) return;
    unit.ax = bx - this.drag.dx;
    unit.ay = by - this.drag.dy;
    this.drag.samples.push({ t: this.clock(), x: bx, y: by });
    if (this.drag.samples.length > 6) this.drag.samples.shift();
  }

  /** The view decides whether the pointer is over the trash target (it owns that element). */
  setOverTrash(over: boolean): void {
    if (!this.drag || !this.drag.removable || this.drag.overTrash === over) return;
    this.drag.overTrash = over;
    this.invalidate();
  }
  get overTrash(): boolean {
    return !!this.drag?.overTrash;
  }

  pointerUp(pointerId: number): void {
    if (this.pending && this.pending.pointerId === pointerId && !this.drag) {
      // A tap, not a drag: select for typing (only when letters can be added).
      const tile = this.tiles.get(this.pending.tileId);
      this.pending = null;
      if (tile && this.puzzle.tileGenerator) {
        if (tile.slotId) this.selectSlot(tile.slotId);
        else if (tile.unitId != null) this.selectUnit(tile.unitId);
      }
      return;
    }
    if (!this.drag || this.drag.pointerId !== pointerId) return;
    this.endDrag();
  }

  pointerCancel(): void {
    if (this.drag) this.emit({ type: "grindStop" });
    this.drag = null;
    this.pending = null;
    this.invalidate();
  }

  private beginDrag(press: PendingPress): void {
    const tile = this.tiles.get(press.tileId);
    if (!tile) return;
    if (tile.slotId) {
      const slot = this.slots.get(tile.slotId);
      if (slot) slot.tileId = null;
      this.createUnit([tile.id], tile.x, tile.y);
    }
    const unit = tile.unitId != null ? this.units.get(tile.unitId) : undefined;
    if (!unit) return;
    unit.vx = 0;
    unit.vy = 0;
    const removable =
      !!this.puzzle.tileGenerator && unit.tileIds.every((tid) => this.tiles.get(tid)?.generated);
    this.drag = {
      unitId: unit.id,
      pointerId: press.pointerId,
      dx: press.startX - unit.ax,
      dy: press.startY - unit.ay,
      removable,
      overTrash: false,
      samples: [],
      lastAx: unit.ax,
      lastAy: unit.ay,
    };
    this.pending = null;
    this.bringUnitToFront(unit);
    this.emit({ type: "pick" });
    this.emit({ type: "grindStart" });
    this.deselect();
    this.invalidate();
  }

  /** Press-and-drag a fresh letter tile straight out of the bank. */
  bankDragStart(letter: string, pointerId: number, bx: number, by: number): void {
    if (this.drag) return;
    const L = this.layout;
    const tile = this.createTile(this.nextGenId(), letter, true);
    tile.x = bx - L.tileW / 2;
    tile.y = by - L.tileH / 2;
    tile.s = 1;
    const unit = this.createUnit([tile.id], tile.x, tile.y);
    this.drag = {
      unitId: unit.id,
      pointerId,
      dx: L.tileW / 2,
      dy: L.tileH / 2,
      removable: true,
      overTrash: false,
      samples: [],
      lastAx: unit.ax,
      lastAy: unit.ay,
    };
    this.bringUnitToFront(unit);
    this.emit({ type: "pick" });
    this.emit({ type: "grindStart" });
    this.deselect();
    this.invalidate();
  }

  private endDrag(): void {
    const drag = this.drag;
    if (!drag) return;
    this.emit({ type: "grindStop" });
    const unit = this.units.get(drag.unitId);
    this.drag = null;
    this.pending = null;
    if (!unit) return this.invalidate();
    if (drag.overTrash && drag.removable) {
      this.removeUnit(unit);
      this.emit({ type: "remove" });
      this.save();
      return this.invalidate();
    }
    const mapping = this.computeSlotMapping(unit);
    if (mapping) this.placeMapping(unit, mapping);
    else if (!this.tryMergeChains(unit)) {
      const v = flickVelocity(drag.samples, this.clock());
      if (v) {
        unit.vx = v.vx;
        unit.vy = v.vy;
      }
      this.emit({ type: "drop" });
    }
    this.save();
    this.maybeCheckSolution();
    this.invalidate();
  }

  private handleDoubleTap(tile: TileState): void {
    if (tile.locked || tile.dying) return;
    if (tile.slotId) {
      this.popTileOutOfSlot(tile);
      this.emit({ type: "pick" });
      this.save();
      this.lastCheckSignature = null;
    } else {
      const unit = tile.unitId != null ? this.units.get(tile.unitId) : undefined;
      if (unit && unit.tileIds.length > 1) {
        this.detachTileFromChain(tile, unit);
        this.emit({ type: "pick" });
        this.save();
      } else tile.hopAt = this.clock();
    }
    this.invalidate();
  }

  /* ---------------------------------------- placing, chaining, removing */
  private computeSlotMapping(unit: UnitState): [TileState, SlotState][] | null {
    const L = this.layout;
    const radius = Math.max(L.tileW, L.tileH) * 0.7;
    const used = new Set<string>();
    const mapping: [TileState, SlotState][] = [];
    const single = unit.tileIds.length === 1;
    for (let i = 0; i < unit.tileIds.length; i++) {
      const tile = this.tiles.get(unit.tileIds[i] ?? "");
      if (!tile) return null;
      const cx = unit.ax + tileOffsetInUnit(i, L) + L.tileW / 2;
      const cy = unit.ay + L.tileH / 2;
      let best: SlotState | null = null;
      let bestDist = radius;
      for (const slot of this.slots.values()) {
        if (used.has(slot.id) || slot.locked) continue;
        if (slot.tileId && !single) continue;
        const d = Math.hypot(slot.px + L.tileW / 2 - cx, slot.py + L.tileH / 2 - cy);
        if (d < bestDist) {
          bestDist = d;
          best = slot;
        }
      }
      if (!best) return null;
      used.add(best.id);
      mapping.push([tile, best]);
    }
    return mapping;
  }

  private placeMapping(unit: UnitState, mapping: [TileState, SlotState][]): void {
    this.units.delete(unit.id);
    const now = this.clock();
    for (const [tile, slot] of mapping) {
      if (slot.tileId) {
        const evicted = this.tiles.get(slot.tileId);
        if (evicted) this.popTileOutOfSlot(evicted);
      }
      tile.unitId = null;
      tile.slotId = slot.id;
      slot.tileId = tile.id;
      tile.snapAt = now;
      tile.z = SLOT_Z;
      this.emit({ type: "slotFlash", slotId: slot.id });
    }
    this.emit({ type: "snap" });
  }

  private popTileOutOfSlot(tile: TileState): void {
    const slot = tile.slotId ? this.slots.get(tile.slotId) : undefined;
    if (slot) slot.tileId = null;
    tile.slotId = null;
    tile.rot = (this.random() - 0.5) * 6;
    const unit = this.createUnit(
      [tile.id],
      tile.x + (this.random() - 0.5) * 24,
      tile.y + this.layout.tileH * 1.1,
    );
    this.bringUnitToFront(unit);
  }

  private chainingEnabled(): boolean {
    const p = this.puzzle;
    return p.chainTiles != null ? p.chainTiles : !!p.tileGenerator;
  }

  private tryMergeChains(unit: UnitState): boolean {
    if (!this.chainingEnabled()) return false;
    const L = this.layout;
    const maxDx = L.tileW * 0.55;
    const maxDy = L.tileH * 0.55;
    let best: { d: number; other: UnitState; side: "left" | "right" } | null = null;
    for (const other of this.units.values()) {
      if (other.id === unit.id) continue;
      const rightX = other.ax + unitWidth(other, L) + CHAIN_GAP;
      if (Math.abs(unit.ax - rightX) < maxDx && Math.abs(unit.ay - other.ay) < maxDy) {
        const d = Math.hypot(unit.ax - rightX, unit.ay - other.ay);
        if (!best || d < best.d) best = { d, other, side: "right" };
      }
      const leftX = other.ax - unitWidth(unit, L) - CHAIN_GAP;
      if (Math.abs(unit.ax - leftX) < maxDx && Math.abs(unit.ay - other.ay) < maxDy) {
        const d = Math.hypot(unit.ax - leftX, unit.ay - other.ay);
        if (!best || d < best.d) best = { d, other, side: "left" };
      }
    }
    if (!best) return false;
    const { other, side } = best;
    const tileIds =
      side === "right" ? [...other.tileIds, ...unit.tileIds] : [...unit.tileIds, ...other.tileIds];
    const anchorX = side === "right" ? other.ax : other.ax - unitWidth(unit, L) - CHAIN_GAP;
    this.units.delete(unit.id);
    this.units.delete(other.id);
    const merged = this.createUnit(tileIds, anchorX, other.ay);
    this.bringUnitToFront(merged);
    const now = this.clock();
    for (const tid of tileIds) {
      const t = this.tiles.get(tid);
      if (t) {
        t.rot = 0;
        t.snapAt = now;
      }
    }
    this.emit({ type: "snap" });
    return true;
  }

  private detachTileFromChain(tile: TileState, unit: UnitState): void {
    const L = this.layout;
    const index = unit.tileIds.indexOf(tile.id);
    const leftIds = unit.tileIds.slice(0, index);
    const rightIds = unit.tileIds.slice(index + 1);
    this.units.delete(unit.id);
    if (leftIds.length) this.createUnit(leftIds, unit.ax, unit.ay);
    tile.rot = (this.random() - 0.5) * 8;
    const popped = this.createUnit(
      [tile.id],
      unit.ax + tileOffsetInUnit(index, L),
      unit.ay + L.tileH * 0.95,
    );
    this.bringUnitToFront(popped);
    if (rightIds.length)
      this.createUnit(rightIds, unit.ax + tileOffsetInUnit(index + 1, L), unit.ay);
  }

  private removeUnit(unit: UnitState): void {
    this.units.delete(unit.id);
    for (const tid of unit.tileIds) {
      const t = this.tiles.get(tid);
      if (t) t.dying = true;
    }
    // Tiles linger (shrinking) for the exit animation, then leave the model.
    setTimeout(() => {
      for (const tid of unit.tileIds) this.tiles.delete(tid);
      this.invalidate();
    }, 260);
  }

  private removeTileImmediate(tile: TileState): void {
    if (tile.unitId != null) {
      const u = this.units.get(tile.unitId);
      if (u) {
        u.tileIds = u.tileIds.filter((id) => id !== tile.id);
        if (!u.tileIds.length) this.units.delete(u.id);
      }
    }
    if (tile.slotId) {
      const s = this.slots.get(tile.slotId);
      if (s && s.tileId === tile.id) s.tileId = null;
    }
    this.tiles.delete(tile.id);
  }

  /* --------------------------------------------------- selection / typing */
  get canType(): boolean {
    return !!this.puzzle.tileGenerator;
  }

  selectSlot(slotId: string): void {
    const slot = this.slots.get(slotId);
    if (!slot || slot.locked || !this.canType) return;
    this.emit({ type: "interaction" });
    this.selectedUnitId = null;
    if (this.selectedSlotId === slot.id) {
      const other: TypeDir = this.typeDir === "h" ? "v" : "h";
      if (this.grid.hasRun(slot, other)) this.typeDir = other;
    } else {
      this.selectedSlotId = slot.id;
      this.typeDir = this.grid.hasRun(slot, "h") ? "h" : "v";
    }
    this.invalidate();
  }

  private selectUnit(unitId: number): void {
    if (!this.units.has(unitId)) return;
    this.selectedUnitId = unitId;
    this.selectedSlotId = null;
    this.invalidate();
  }

  deselect(): void {
    if (this.selectedSlotId == null && this.selectedUnitId == null) return;
    this.selectedSlotId = null;
    this.selectedUnitId = null;
    this.invalidate();
  }

  private nextGenId(): string {
    return `gen-${this.genCounter++}`;
  }

  /**
   * Where a new letter goes, in priority order: the selected slot, the
   * selected tile group (appended), near the pointer (keyboard), or a free spot.
   */
  addLetter(letter: string, nearPointer: boolean): void {
    if (!this.canType) return;
    this.emit({ type: "interaction" });
    if (this.selectedSlotId) return this.typeLetterIntoSelected(letter);
    if (this.selectedUnitId != null && this.units.has(this.selectedUnitId))
      return this.appendLetterToUnit(this.selectedUnitId, letter);
    if (nearPointer && this.pointer) return this.spawnLetterTile(letter, this.pointer);
    this.spawnLetterTile(letter, null);
  }

  private typeLetterIntoSelected(letter: string): void {
    const slot = this.selectedSlotId ? this.slots.get(this.selectedSlotId) : undefined;
    if (!slot) return;
    if (slot.tileId) {
      const old = this.tiles.get(slot.tileId);
      if (old) this.removeTileImmediate(old);
      slot.tileId = null;
    }
    const tile = this.createTile(this.nextGenId(), letter, true);
    tile.slotId = slot.id;
    slot.tileId = tile.id;
    tile.x = slot.px;
    tile.y = slot.py;
    tile.s = 0.3;
    tile.snapAt = this.clock();
    tile.z = SLOT_Z;
    this.emit({ type: "slotFlash", slotId: slot.id });
    this.emit({ type: "place" });
    const next = this.grid.neighbor(slot, this.typeDir, 1);
    if (next) this.selectedSlotId = next.id;
    this.save();
    this.maybeCheckSolution();
    this.invalidate();
  }

  backspace(): void {
    if (!this.canType) return;
    if (this.selectedSlotId) return this.backspaceSelectedSlot();
    if (this.selectedUnitId != null) return this.backspaceUnit();
    this.removeNewestFreeGeneratedTile();
  }

  private backspaceSelectedSlot(): void {
    let slot = this.selectedSlotId ? this.slots.get(this.selectedSlotId) : undefined;
    if (!slot) return;
    if (slot.tileId) {
      const t = this.tiles.get(slot.tileId);
      if (t) this.removeTileImmediate(t);
      slot.tileId = null;
    } else {
      const prev = this.grid.neighbor(slot, this.typeDir, -1);
      if (prev) {
        this.selectedSlotId = prev.id;
        if (prev.tileId) {
          const t = this.tiles.get(prev.tileId);
          if (t) this.removeTileImmediate(t);
          prev.tileId = null;
        }
        slot = prev;
      }
    }
    this.emit({ type: "remove" });
    this.save();
    this.lastCheckSignature = null;
    this.invalidate();
  }

  moveSelection(dir: TypeDir, step: 1 | -1): void {
    const slot = this.selectedSlotId ? this.slots.get(this.selectedSlotId) : undefined;
    if (!slot) return;
    const n = this.grid.neighbor(slot, dir, step);
    if (n) {
      this.selectedSlotId = n.id;
      this.typeDir = dir;
      this.invalidate();
    }
  }

  private appendLetterToUnit(unitId: number, letter: string): void {
    const unit = this.units.get(unitId);
    if (!unit) return;
    const L = this.layout;
    const tile = this.createTile(this.nextGenId(), letter, true);
    tile.unitId = unit.id;
    unit.tileIds.push(tile.id);
    const idx = unit.tileIds.length - 1;
    tile.x = unit.ax + tileOffsetInUnit(idx, L);
    tile.y = unit.ay;
    tile.s = 0.3;
    tile.snapAt = this.clock();
    clampUnit(unit, L);
    this.bringUnitToFront(unit);
    this.emit({ type: "place" });
    this.save();
    this.invalidate();
  }

  private backspaceUnit(): void {
    const unit = this.selectedUnitId != null ? this.units.get(this.selectedUnitId) : undefined;
    if (!unit) return;
    const tile = this.tiles.get(unit.tileIds[unit.tileIds.length - 1] ?? "");
    if (tile) this.removeTileImmediate(tile);
    if (this.selectedUnitId != null && !this.units.has(this.selectedUnitId))
      this.selectedUnitId = null;
    this.emit({ type: "remove" });
    this.save();
    this.invalidate();
  }

  /**
   * A resting spot for a new loose tile: inside the board, clear of the clue
   * panel and tile bank (the view reports those), and, as far as space allows,
   * not on top of a slot or another tile. Rejection-samples candidates and
   * falls back to the least-overlapping one when the board is crowded; the
   * physics then nudges any residual overlap apart.
   */
  private freeSpot(): Vec {
    const { tileW, tileH, boardW, boardH } = this.layout;
    const bounds = this.spawnBoundsProvider();
    const top = Math.max(66, bounds?.top ?? 0);
    let bottom = Math.min(boardH - tileH - 10, (bounds?.bottom ?? Infinity) - tileH);
    if (bottom < top) bottom = top;
    const slotPad = 6;
    const obstacles: { x: number; y: number; w: number; h: number; weight: number }[] = [];
    for (const u of this.units.values())
      obstacles.push({ x: u.ax, y: u.ay, w: unitWidth(u, this.layout), h: tileH, weight: 1 });
    for (const sl of this.slots.values())
      obstacles.push({
        x: sl.px - slotPad,
        y: sl.py - slotPad,
        w: tileW + slotPad * 2,
        h: tileH + slotPad * 2,
        weight: 0.6, // prefer a clear patch of board, but a slot beats a tile pile
      });
    let best: Vec = { x: boardW / 2 - tileW / 2, y: (top + bottom) / 2 };
    let bestOv = Infinity;
    for (let i = 0; i < 60; i++) {
      const x = 6 + this.random() * Math.max(1, boardW - tileW - 12);
      const y = top + this.random() * Math.max(1, bottom - top);
      let ov = 0;
      for (const o of obstacles) {
        const ox = Math.min(x + tileW, o.x + o.w) - Math.max(x, o.x);
        const oy = Math.min(y + tileH, o.y + o.h) - Math.max(y, o.y);
        if (ox > 0 && oy > 0) ov += ox * oy * o.weight;
      }
      if (ov === 0) return { x, y };
      if (ov < bestOv) {
        bestOv = ov;
        best = { x, y };
      }
    }
    return best;
  }

  private spawnLetterTile(letter: string, pos: Vec | null): void {
    const { tileW, tileH, boardW, boardH } = this.layout;
    const tile = this.createTile(this.nextGenId(), letter, true);
    let spot: Vec;
    if (pos) {
      // Scatter within a small disc around the pointer so repeated letters pile
      // up rather than stacking into a column.
      const ang = this.random() * Math.PI * 2;
      const rad = this.random() * tileW * 0.5;
      spot = {
        x: clamp(pos.x - tileW / 2 + Math.cos(ang) * rad, 4, boardW - tileW - 4),
        y: clamp(pos.y - tileH / 2 + Math.sin(ang) * rad, 4, boardH - tileH - 4),
      };
    } else spot = this.freeSpot();
    const unit = this.createUnit([tile.id], spot.x, spot.y);
    tile.x = unit.ax;
    tile.y = unit.ay;
    tile.s = 0.2;
    tile.pulseAt = this.clock();
    this.bringUnitToFront(unit);
    this.emit({ type: "place" });
    this.save();
    this.invalidate();
  }

  private removeNewestFreeGeneratedTile(): void {
    let newest: { unit: UnitState; tile: TileState } | null = null;
    for (const u of this.units.values()) {
      if (u.tileIds.length !== 1) continue;
      const t = this.tiles.get(u.tileIds[0] ?? "");
      if (!t || !t.generated || t.dying) continue;
      if (!newest || genIndex(t.id) > genIndex(newest.tile.id)) newest = { unit: u, tile: t };
    }
    if (newest) {
      this.removeUnit(newest.unit);
      this.emit({ type: "remove" });
      this.save();
      this.invalidate();
    }
  }

  toggleBank(force?: boolean): void {
    if (!this.puzzle.tileGenerator) return;
    const open = force ?? !this.bankOpen;
    if (open === this.bankOpen) return;
    this.bankOpen = open;
    this.emit({ type: "interaction" });
    this.emit({ type: "bank", open });
    this.invalidate();
  }

  togglePrompt(force?: boolean): void {
    this.promptCollapsed = force ?? !this.promptCollapsed;
    this.invalidate();
  }

  /* ---------------------------------------------------- solution checking */
  private reader(): BoardReader {
    return {
      textInSlot: (id) => {
        const s = this.slots.get(id);
        const t = s?.tileId ? this.tiles.get(s.tileId) : undefined;
        return t ? t.text.toUpperCase() : null;
      },
      tileIdInSlot: (id) => this.slots.get(id)?.tileId ?? null,
    };
  }

  private maybeCheckSolution(options: { quiet?: boolean } = {}): void {
    if (this.solved) return;
    const slots = [...this.slots.values()];
    if (!slots.every((s) => s.tileId)) {
      this.lastCheckSignature = null;
      return;
    }
    const signature = slots.map((s) => s.tileId).join(",");
    if (signature === this.lastCheckSignature) return;
    this.lastCheckSignature = signature;
    if (evaluateChecks(this.puzzle.checks, this.reader())) this.onSolved(!options.quiet);
    else if (!options.quiet) {
      this.emit({ type: "shake" });
      this.emit({ type: "bad" });
      this.mistakes++; // each distinct wrong full board is one mistake
      const ids = this.noHelp()
        ? slots.map((s) => s.tileId).filter((id): id is string => !!id)
        : [...wrongTileIds(this.puzzle.checks, this.reader())];
      this.ejectTiles(ids);
      this.save();
    }
  }

  /** Pop tiles a little way out of their slots with a small jolt. */
  private ejectTiles(tileIds: readonly string[]): void {
    let any = false;
    for (const id of tileIds) {
      const tile = this.tiles.get(id);
      if (!tile) continue;
      any = true;
      const slot = tile.slotId ? this.slots.get(tile.slotId) : undefined;
      if (slot) slot.tileId = null;
      tile.slotId = null;
      tile.rot = (this.random() - 0.5) * 12;
      const unit = this.createUnit(
        [tile.id],
        tile.x + (this.random() - 0.5) * 14,
        tile.y + this.layout.tileH * 0.35 + this.random() * 6,
      );
      unit.vx = (this.random() - 0.5) * 4;
      unit.vy = 1.5 + this.random() * 2;
      this.bringUnitToFront(unit);
    }
    if (any) this.lastCheckSignature = null;
  }

  private onSolved(celebrate: boolean): void {
    this.solved = true;
    this.solvedEver = true;
    this.save();
    this.deselect();
    this.bankOpen = false;
    // Freeze the solution (its tiles and slots) but leave the rest of the board live.
    for (const slot of this.slots.values()) {
      if (!slot.tileId) continue;
      slot.locked = true;
      const t = this.tiles.get(slot.tileId);
      if (t) {
        t.locked = true;
        t.z = SLOT_Z;
      }
    }
    this.promptCollapsed = false; // keep the clue on screen to admire
    if (celebrate) {
      const placed = [...this.slots.values()]
        .filter((s) => s.tileId)
        .sort((a, b) => a.py - b.py || a.px - b.px)
        .map((s) => (s.tileId ? this.tiles.get(s.tileId) : undefined));
      const now = this.clock();
      placed.forEach((tile, i) => {
        if (tile) tile.hopAt = now + 120 + i * 55;
      });
      this.emit({ type: "confetti" });
      this.emit({ type: "solve" });
    }
  }

  private computeCategoryBackdrops(): CategoryBackdrop[] {
    const out: CategoryBackdrop[] = [];
    const L = this.layout;
    const pad = 5;
    for (const check of this.puzzle.checks) {
      if (check.type !== "categories") continue;
      const matches = matchCategories(check, this.reader()) ?? [];
      for (const { groupIndex, categoryIndex } of matches) {
        const slots = (check.slotGroups[groupIndex] ?? [])
          .map((id) => this.slots.get(id))
          .filter((s): s is SlotState => !!s);
        if (!slots.length) continue;
        const minX = Math.min(...slots.map((s) => s.px));
        const maxX = Math.max(...slots.map((s) => s.px + L.tileW));
        const minY = Math.min(...slots.map((s) => s.py));
        const maxY = Math.max(...slots.map((s) => s.py + L.tileH));
        out.push({
          x: minX - pad,
          y: minY - pad,
          w: maxX - minX + pad * 2,
          h: maxY - minY + pad * 2,
          categoryIndex,
          label: check.categories[categoryIndex]?.label ?? "",
        });
      }
    }
    return out.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  /** For tests / debugging: current category matches for a check. */
  categoryMatches(check: Extract<Check, { type: "categories" }>): CategoryMatch[] | null {
    return matchCategories(check, this.reader());
  }

  /* ----------------------------------------------------------------- hints */
  get hints(): readonly Hint[] {
    return this.puzzle.hints ?? [];
  }

  hintSizes(): string[] {
    const sizes: string[] = [];
    for (const h of this.hints) if (!sizes.includes(h.size)) sizes.push(h.size);
    return sizes;
  }

  hintsRemaining(size: string): number {
    const total = this.hints.filter((h) => h.size === size).length;
    const used = this.revealedHints.filter((i) => this.hints[i]?.size === size).length;
    return total - used;
  }

  revealNextHint(size: string): Hint | null {
    const index = this.hints.findIndex(
      (h, i) => h.size === size && !this.revealedHints.includes(i),
    );
    if (index < 0) return null;
    this.revealedHints.push(index);
    this.save();
    const hint = this.hints[index];
    if (hint) this.applyHint(hint);
    return hint ?? null;
  }

  applyHint(hint: Hint): void {
    this.clearHighlightsInternal();
    this.activeHint = hint;
    const hl = hint.highlight ?? {};
    this.promptMarks = typeof hl.prompt === "string" ? [hl.prompt] : [...(hl.prompt ?? [])];
    if (this.promptMarks.length) this.promptCollapsed = false;
    for (const slotId of hl.slots ?? []) if (this.slots.has(slotId)) this.glowSlots.add(slotId);
    for (const key of hl.tiles ?? [])
      for (const tile of this.tiles.values())
        if (tile.id === key || tile.text.toUpperCase() === key.toUpperCase())
          this.glowTiles.add(tile.id);
    // Highlights persist until a new hint is applied or the hint is dismissed.
    this.invalidate();
  }

  private clearHighlightsInternal(): void {
    this.glowSlots.clear();
    this.glowTiles.clear();
    this.promptMarks = [];
    this.activeHint = null;
  }

  clearHighlights(): void {
    this.clearHighlightsInternal();
    this.invalidate();
  }

  /* --------------------------------------------------------------- reset */
  /** Clear the board (tiles, solution lock) but keep the record of hints used and mistakes made. */
  reset(): void {
    this.clearHighlightsInternal();
    this.selectedSlotId = null;
    this.selectedUnitId = null;
    this.drag = null;
    this.pending = null;
    this.tiles.clear();
    this.units.clear();
    for (const s of this.slots.values()) {
      s.tileId = null;
      s.locked = false;
    }
    this.solved = false;
    this.lastCheckSignature = null;
    this.promptCollapsed = false;
    this.dealFreshBoard();
    this.save();
    this.invalidate();
  }

  /** Stop any in-flight drag (used when the puzzle view unmounts). */
  dispose(): void {
    if (this.drag) this.emit({ type: "grindStop" });
    this.drag = null;
    this.pending = null;
    this.listeners.clear();
  }
}

function genIndex(id: string): number {
  const n = Number(id.replace(/^gen-/, ""));
  return Number.isFinite(n) ? n : -1;
}
