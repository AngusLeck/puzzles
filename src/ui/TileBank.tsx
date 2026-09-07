import { useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { DRAG_START_DIST, type Engine } from "@/engine/engine";

interface Props {
  engine: Engine;
  letters: string;
  open: boolean;
  boardRef: RefObject<HTMLDivElement | null>;
  trashRef: RefObject<HTMLDivElement | null>;
  bankRef: RefObject<HTMLDivElement | null>;
}

/**
 * Roll-up drawer of letter keys. Tap a key to mint a tile (into the selected
 * slot / group, else a free spot); press-and-drag to pull a fresh tile
 * straight out onto the board.
 */
export function TileBank({ engine, letters, open, boardRef, trashRef, bankRef }: Props) {
  const press = useRef<{
    pointerId: number;
    letter: string;
    startX: number;
    startY: number;
    dragging: boolean;
  } | null>(null);

  const toBoard = (e: ReactPointerEvent) => {
    const r = boardRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: e.clientX, y: e.clientY };
  };

  const onKeyDown = (e: ReactPointerEvent<HTMLButtonElement>, letter: string) => {
    e.preventDefault();
    press.current = {
      pointerId: e.pointerId,
      letter,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onKeyMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p || p.pointerId !== e.pointerId) return;
    const b = toBoard(e);
    if (!p.dragging) {
      if (Math.hypot(e.clientX - p.startX, e.clientY - p.startY) < DRAG_START_DIST) return;
      p.dragging = true;
      engine.bankDragStart(p.letter, e.pointerId, b.x, b.y);
    }
    engine.pointerMove(e.pointerId, b.x, b.y);
    const tr = trashRef.current?.getBoundingClientRect();
    if (tr) {
      const near =
        Math.hypot(e.clientX - (tr.left + tr.width / 2), e.clientY - (tr.top + tr.height / 2)) <
        tr.width * 0.9;
      engine.setOverTrash(near);
    }
  };
  const onKeyUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p || p.pointerId !== e.pointerId) return;
    press.current = null;
    if (p.dragging) engine.pointerUp(e.pointerId);
    else engine.addLetter(p.letter, false);
  };
  const onKeyCancel = () => {
    if (press.current?.dragging) engine.pointerCancel();
    press.current = null;
  };

  return (
    <div ref={bankRef} className={"tileBank" + (open ? " open" : "")} data-testid="tile-bank">
      <button
        type="button"
        className="bankHandle"
        onClick={() => engine.toggleBank()}
        aria-expanded={open}
      >
        <span className="chev">▲</span>
        <span>Tile bank</span>
      </button>
      <div className="bankKeys">
        {[...letters].map((letter) => (
          <button
            type="button"
            key={letter}
            className="key"
            onPointerDown={(e) => onKeyDown(e, letter)}
            onPointerMove={onKeyMove}
            onPointerUp={onKeyUp}
            onPointerCancel={onKeyCancel}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
