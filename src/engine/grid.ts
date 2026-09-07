import type { SlotState, TypeDir } from "./types";

const key = (x: number, y: number) => `${x}|${y}`;

/** Grid-coordinate lookup so typing can walk across/down a run of slots. */
export class SlotGrid {
  private byCoord = new Map<string, SlotState>();

  constructor(slots: Iterable<SlotState>) {
    for (const s of slots) this.byCoord.set(key(s.def.x, s.def.y), s);
  }

  neighbor(slot: SlotState, dir: TypeDir, step: number): SlotState | null {
    const x = slot.def.x + (dir === "h" ? step : 0);
    const y = slot.def.y + (dir === "v" ? step : 0);
    return this.byCoord.get(key(x, y)) ?? null;
  }

  hasRun(slot: SlotState, dir: TypeDir): boolean {
    return !!(this.neighbor(slot, dir, 1) || this.neighbor(slot, dir, -1));
  }

  /** The contiguous run of slots through `slot` along `dir`, in order. */
  run(slot: SlotState, dir: TypeDir): SlotState[] {
    const cells = [slot];
    for (let step = -1; ; step--) {
      const n = this.neighbor(slot, dir, step);
      if (!n) break;
      cells.unshift(n);
    }
    for (let step = 1; ; step++) {
      const n = this.neighbor(slot, dir, step);
      if (!n) break;
      cells.push(n);
    }
    return cells;
  }
}
