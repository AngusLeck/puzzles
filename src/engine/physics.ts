import type { Layout, UnitState } from "./types";
import { clamp } from "./layout";

export const CHAIN_GAP = 2;
const EDGE = 4;
/** The dragged unit takes nearly all displacement; heavy neighbours only creep. */
const YIELD = 0.965;
const FRICTION = 0.8;

export function unitWidth(u: UnitState, L: Layout): number {
  const n = u.tileIds.length;
  return n * L.tileW + (n - 1) * CHAIN_GAP;
}

export function tileOffsetInUnit(index: number, L: Layout): number {
  return index * (L.tileW + CHAIN_GAP);
}

/** Apply residual velocity from a flick, with heavy friction: slabs don't skid. */
export function integrate(units: Iterable<UnitState>): void {
  for (const u of units) {
    if (!u.vx && !u.vy) continue;
    u.ax += u.vx;
    u.ay += u.vy;
    u.vx *= FRICTION;
    u.vy *= FRICTION;
    if (Math.abs(u.vx) < 0.3) u.vx = 0;
    if (Math.abs(u.vy) < 0.3) u.vy = 0;
  }
}

/**
 * Fully resolve overlaps (tiles never overlap). The dragged unit yields, so a
 * drag has to slide *around* neighbours; two loose units share the push evenly.
 */
export function separateUnits(units: UnitState[], L: Layout, draggedId: number | null): void {
  for (let iter = 0; iter < 4; iter++) {
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i];
        const b = units[j];
        if (!a || !b) continue;
        const aw = unitWidth(a, L);
        const bw = unitWidth(b, L);
        const penX = Math.min(a.ax + aw, b.ax + bw) - Math.max(a.ax, b.ax) + 1.5;
        const penY = Math.min(a.ay + L.tileH, b.ay + L.tileH) - Math.max(a.ay, b.ay) + 1.5;
        if (penX <= 0 || penY <= 0) continue;
        const aDragged = a.id === draggedId;
        const bDragged = b.id === draggedId;
        const aShare = aDragged ? YIELD : bDragged ? 1 - YIELD : 0.5;
        const bShare = 1 - aShare;
        if (penX < penY) {
          const dir = Math.sign(a.ax + aw / 2 - (b.ax + bw / 2)) || 1;
          a.ax += dir * penX * aShare;
          b.ax -= dir * penX * bShare;
        } else {
          const dir = Math.sign(a.ay - b.ay) || 1;
          a.ay += dir * penY * aShare;
          b.ay -= dir * penY * bShare;
        }
      }
    }
  }
}

export function clampUnit(u: UnitState, L: Layout): void {
  u.ax = clamp(u.ax, EDGE, L.boardW - unitWidth(u, L) - EDGE);
  u.ay = clamp(u.ay, EDGE, L.boardH - L.tileH - EDGE);
}

export function clampUnits(units: Iterable<UnitState>, L: Layout): void {
  for (const u of units) clampUnit(u, L);
}

/** Momentum from the last few pointer samples: only a genuine flick, and not far. */
export function flickVelocity(
  samples: readonly { t: number; x: number; y: number }[],
  now: number,
): { vx: number; vy: number } | null {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!first || !last || samples.length < 2 || now - last.t >= 70) return null;
  const dt = Math.max(1, last.t - first.t);
  const vx = (last.x - first.x) / dt;
  const vy = (last.y - first.y) / dt;
  if (Math.hypot(vx, vy) <= 0.9) return null;
  return { vx: clamp(vx * 5, -8, 8), vy: clamp(vy * 5, -8, 8) };
}
