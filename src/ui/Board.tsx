import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { Engine, type SlotView, type Snapshot, type TileView } from "@/engine/engine";
import type { EngineEvent } from "@/engine/types";

export const CATEGORY_COLORS = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)", "var(--cat-4)"];

export type EventBus = { subscribe(fn: (e: EngineEvent) => void): () => void };

interface Props {
  engine: Engine;
  snapshot: Snapshot;
  events: EventBus;
  boardRef: RefObject<HTMLDivElement | null>;
  trashRef: RefObject<HTMLDivElement | null>;
}

/**
 * The play surface. React owns the *set* of slot/tile elements and their
 * discrete classes (selected, glow, lifted...). The per-frame work (eased
 * positions, z-order, drop targets) bypasses React entirely: an rAF loop
 * steps the engine and writes transforms straight onto the DOM nodes.
 */
export function Board({ engine, snapshot, events, boardRef, trashRef }: Props) {
  const tileEls = useRef(new Map<string, HTMLDivElement>());
  const slotEls = useRef(new Map<string, HTMLDivElement>());
  const fxRef = useRef<HTMLDivElement>(null);
  const shakeTimer = useRef(0);

  // Keep the engine's idea of the board size in step with the element.
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => engine.resize(el.clientWidth, el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [engine, boardRef]);

  // Frame loop.
  useEffect(() => {
    let raf = 0;
    const prevTargets = new Set<string>();
    const tick = (now: number) => {
      engine.step(now);
      const L = engine.layout;
      for (const tile of engine.tiles.values()) {
        const el = tileEls.current.get(tile.id);
        if (!el) continue;
        const t = Engine.tileTransform(tile, now, L);
        el.style.transform = `translate(${t.x.toFixed(2)}px,${t.y.toFixed(2)}px) rotate(${t.r.toFixed(2)}deg) scale(${t.s.toFixed(3)})`;
        const z = String(tile.z);
        if (el.style.zIndex !== z) el.style.zIndex = z;
      }
      const targets = engine.targetSlotIds;
      for (const id of prevTargets)
        if (!targets.has(id)) slotEls.current.get(id)?.classList.remove("target");
      for (const id of targets)
        if (!prevTargets.has(id)) slotEls.current.get(id)?.classList.add("target");
      prevTargets.clear();
      for (const id of targets) prevTargets.add(id);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine]);

  // One-shot effects driven by engine events.
  useEffect(
    () =>
      events.subscribe((e) => {
        const board = boardRef.current;
        if (e.type === "shake" && board) {
          board.classList.remove("shake");
          void board.offsetWidth; // restart the animation
          board.classList.add("shake");
          clearTimeout(shakeTimer.current);
          shakeTimer.current = window.setTimeout(() => board.classList.remove("shake"), 450);
        } else if (e.type === "slotFlash") {
          const el = slotEls.current.get(e.slotId);
          if (!el) return;
          el.classList.add("snapFlash");
          setTimeout(() => el.classList.remove("snapFlash"), 200);
        } else if (e.type === "confetti" && fxRef.current) {
          launchConfetti(fxRef.current, engine.layout.boardW, engine.layout.boardH);
        }
      }),
    [events, engine, boardRef],
  );

  const toBoard = (e: ReactPointerEvent) => {
    const r = boardRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: e.clientX, y: e.clientY };
  };

  const updateTrash = (e: ReactPointerEvent) => {
    if (!engine.getSnapshot().dragRemovable) return;
    const tr = trashRef.current?.getBoundingClientRect();
    if (!tr) return;
    const near =
      Math.hypot(e.clientX - (tr.left + tr.width / 2), e.clientY - (tr.top + tr.height / 2)) <
      tr.width * 0.9;
    engine.setOverTrash(near);
  };

  const onTileDown = (e: ReactPointerEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const p = toBoard(e);
    if (engine.tilePointerDown(id, e.pointerId, p.x, p.y) === "drag-armed") {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* capture unsupported */
      }
    }
  };
  const onTileMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = toBoard(e);
    engine.pointerMove(e.pointerId, p.x, p.y);
    updateTrash(e);
  };
  const onTileUp = (e: ReactPointerEvent<HTMLDivElement>) => engine.pointerUp(e.pointerId);
  const onTileCancel = () => engine.pointerCancel();

  const onBoardDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Tapping empty board space deselects the current slot / tile group.
    const cls = (e.target as HTMLElement).classList;
    if (
      cls.contains("board") ||
      cls.contains("slotLayer") ||
      cls.contains("tileLayer") ||
      cls.contains("rowBackdrops") ||
      cls.contains("fxLayer")
    )
      engine.deselect();
  };
  const onBoardMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    engine.pointer = toBoard(e); // typed letters land near the pointer
  };

  const { layout: L } = snapshot;
  return (
    <div
      ref={boardRef}
      className="board"
      onPointerDown={onBoardDown}
      onPointerMove={onBoardMove}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="rowBackdrops">
        {snapshot.categoryBackdrops.map((b, i) => (
          <div
            key={i}
            className="rowBackdrop"
            style={{
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              background: CATEGORY_COLORS[b.categoryIndex % CATEGORY_COLORS.length],
            }}
          />
        ))}
      </div>
      <div className="slotLayer">
        {snapshot.slots.map((s) => (
          <Slot
            key={s.id}
            slot={s}
            w={L.tileW}
            h={L.tileH}
            canSelect={engine.canType}
            register={(el) => (el ? slotEls.current.set(s.id, el) : slotEls.current.delete(s.id))}
            onSelect={() => engine.selectSlot(s.id)}
          />
        ))}
      </div>
      <div className={"tileLayer" + (snapshot.dragging ? " dragging" : "")}>
        {snapshot.tiles.map((t) => (
          <Tile
            key={t.id}
            tile={t}
            w={L.tileW}
            h={L.tileH}
            register={(el) => (el ? tileEls.current.set(t.id, el) : tileEls.current.delete(t.id))}
            onDown={onTileDown}
            onMove={onTileMove}
            onUp={onTileUp}
            onCancel={onTileCancel}
          />
        ))}
      </div>
      <div className="fxLayer" ref={fxRef} />
    </div>
  );
}

const Slot = memo(function Slot({
  slot: s,
  w,
  h,
  canSelect,
  register,
  onSelect,
}: {
  slot: SlotView;
  w: number;
  h: number;
  canSelect: boolean;
  register: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
}) {
  const cls = [
    "slot",
    s.selected ? "selected" : "",
    s.inRun ? "inrun" : "",
    s.filled ? "filled" : "",
    s.glow ? "glow" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      ref={register}
      className={cls}
      data-slot-id={s.id}
      style={{ left: s.px, top: s.py, width: w, height: h }}
      onPointerDown={(e) => {
        if (!canSelect || s.locked) return;
        e.stopPropagation();
        onSelect();
      }}
    >
      {s.label != null && <span className="slotLabel">{s.label}</span>}
      {s.centerLabel != null && (
        <span className="slotCenterLabel" style={{ fontSize: s.centerLabelFontSize }}>
          {s.centerLabel}
        </span>
      )}
    </div>
  );
});

const Tile = memo(function Tile({
  tile: t,
  w,
  h,
  register,
  onDown,
  onMove,
  onUp,
  onCancel,
}: {
  tile: TileView;
  w: number;
  h: number;
  register: (el: HTMLDivElement | null) => void;
  onDown: (e: ReactPointerEvent<HTMLDivElement>, id: string) => void;
  onMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onCancel: () => void;
}) {
  const cls = [
    "tile",
    t.lifted ? "lifted" : "",
    t.glow ? "glow" : "",
    t.selected ? "selected" : "",
    t.locked ? "locked" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      ref={register}
      className={cls}
      data-tile-id={t.id}
      data-slotted={t.slotted ? "1" : undefined}
      style={{ width: w, height: h, fontSize: t.fontSize }}
      onPointerDown={(e) => onDown(e, t.id)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
    >
      {t.text}
    </div>
  );
});

function launchConfetti(layer: HTMLDivElement, boardW: number, boardH: number) {
  const colors = ["#f5c84c", "#93c464", "#7cb7e0", "#b58fd9", "#e2704a", "#fffdf8"];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("div");
    const size = 5 + Math.random() * 6;
    const x = Math.random() * boardW;
    piece.className = "confettiPiece";
    piece.style.width = `${size}px`;
    piece.style.height = `${size * (0.5 + Math.random())}px`;
    piece.style.background = colors[i % colors.length] ?? "#fff";
    layer.appendChild(piece);
    const drift = (Math.random() - 0.5) * 160;
    piece.animate(
      [
        { transform: `translate(${x}px, -20px) rotate(0deg)`, opacity: 1 },
        {
          transform: `translate(${x + drift}px, ${boardH + 30}px) rotate(${540 + Math.random() * 540}deg)`,
          opacity: 0.9,
        },
      ],
      {
        duration: 1400 + Math.random() * 1200,
        delay: Math.random() * 350,
        easing: "cubic-bezier(.25,.4,.6,1)",
      },
    ).onfinish = () => piece.remove();
  }
}
