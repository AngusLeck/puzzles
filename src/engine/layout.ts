import type { Layout, Puzzle } from "./types";

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

const PAD = 14;
const TOP_INSET = 62;
const MAX_TILE_H = 62;
const MIN_TILE_H = 34;

export function slotGridExtents(puzzle: Puzzle): { maxX: number; maxY: number } {
  let maxX = 0;
  let maxY = 0;
  for (const s of puzzle.slots) {
    maxX = Math.max(maxX, s.x);
    maxY = Math.max(maxY, s.y);
  }
  return { maxX, maxY };
}

/**
 * Fit the slot constellation to the board. Tiles scale so the widest row fits
 * the board width (between MIN/MAX), the grid is centred horizontally and,
 * unless it's taller than the free space, vertically in the play area.
 */
export function computeLayout(puzzle: Puzzle, boardW: number, boardH: number): Layout {
  const aspect = puzzle.tileAspect ?? 1;
  const gap = puzzle.slotGap ?? 8;
  const { maxX, maxY } = slotGridExtents(puzzle);
  const cols = maxX + 1;
  const fitH = ((boardW - 2 * PAD + gap) / cols - gap) / aspect;
  const tileH = clamp(fitH, Math.min(MIN_TILE_H, fitH), MAX_TILE_H);
  const tileW = tileH * aspect;
  const pitchX = tileW + gap;
  const pitchY = tileH + gap;
  const spanW = maxX * pitchX + tileW;
  const offsetX = Math.max(PAD, (boardW - spanW) / 2);

  const gridH = maxY * pitchY + tileH;
  const bankInset = puzzle.tileGenerator ? 58 : 16;
  const freeH = boardH - TOP_INSET - bankInset;
  const offsetY = gridH >= freeH ? TOP_INSET : TOP_INSET + (freeH - gridH) / 2;

  return {
    boardW,
    boardH,
    tileW,
    tileH,
    gap,
    pitchX,
    pitchY,
    offsetX,
    offsetY,
    scatterTop: offsetY + gridH + 16,
    scatterBottom: boardH - bankInset - tileH - 8,
  };
}

export function slotPosition(L: Layout, x: number, y: number): { px: number; py: number } {
  return { px: L.offsetX + x * L.pitchX, py: L.offsetY + y * L.pitchY };
}

/** Font size that keeps a tile's text clear of its edges (about 11px side padding for words). */
export function tileFontSize(L: Layout, text: string): number {
  const len = text.length;
  const size = len <= 2 ? L.tileH * 0.48 : Math.min(L.tileH * 0.44, (L.tileW - 22) / (len * 0.6));
  return Math.max(10, size);
}

export function centerLabelFontSize(L: Layout, text: string): number {
  return Math.max(9, tileFontSize(L, text));
}
