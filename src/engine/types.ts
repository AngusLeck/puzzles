import type { PuzzleDef, SlotDef } from "@/puzzles/schema";

export type Vec = { x: number; y: number };

/** Board geometry, derived from the puzzle + the board's pixel size. */
export interface Layout {
  boardW: number;
  boardH: number;
  tileW: number;
  tileH: number;
  gap: number;
  pitchX: number;
  pitchY: number;
  offsetX: number;
  offsetY: number;
  /** Band below the slot grid where a fixed tile set is dealt. */
  scatterTop: number;
  scatterBottom: number;
}

export interface SlotState {
  id: string;
  def: SlotDef;
  /** Top-left in board px (from layout). */
  px: number;
  py: number;
  tileId: string | null;
  locked: boolean;
}

export interface TileState {
  id: string;
  text: string;
  generated: boolean;
  /** Animated (rendered) position/scale/rotation, eased toward a target each frame. */
  x: number;
  y: number;
  s: number;
  r: number;
  /** Resting tilt when loose. */
  rot: number;
  z: number;
  slotId: string | null;
  unitId: number | null;
  locked: boolean;
  dying: boolean;
  lastTap: number;
  hopAt: number;
  pulseAt: number;
  snapAt: number;
}

/** A draggable group of one or more loose tiles laid out side by side. */
export interface UnitState {
  id: number;
  tileIds: string[];
  ax: number;
  ay: number;
  vx: number;
  vy: number;
}

export interface DragState {
  unitId: number;
  pointerId: number;
  /** Pointer offset from the unit's anchor. */
  dx: number;
  dy: number;
  removable: boolean;
  overTrash: boolean;
  samples: { t: number; x: number; y: number }[];
  lastAx: number;
  lastAy: number;
}

export interface PendingPress {
  tileId: string;
  pointerId: number;
  startX: number;
  startY: number;
}

export type TypeDir = "h" | "v";

/** What's persisted per puzzle. Shape is shared with the legacy page (same localStorage key). */
export interface SavedBoard {
  gen: { id: string; text: string }[];
  slots: Record<string, string>;
  units: { tiles: string[]; nx: number; ny: number }[];
}
export interface PuzzleProgress {
  solved?: boolean;
  hints?: number[];
  genCounter?: number;
  mistakes?: number;
  board?: SavedBoard;
}

export type Puzzle = PuzzleDef;

/** Discrete events the engine emits; the audio layer and UI effects subscribe. */
export type EngineEvent =
  | { type: "pick" }
  | { type: "place" }
  | { type: "snap" }
  | { type: "remove" }
  | { type: "drop" }
  | { type: "bad" }
  | { type: "solve" }
  | { type: "bank"; open: boolean }
  | { type: "grindStart" }
  | { type: "grind"; speed: number; contact: boolean }
  | { type: "grindStop" }
  | { type: "shake" }
  | { type: "confetti" }
  | { type: "slotFlash"; slotId: string }
  | { type: "interaction" };
