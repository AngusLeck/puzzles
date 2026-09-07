import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

/**
 * Round floating control + a fast shared tooltip (the native `title` lags
 * about half a second, which made the buttons feel sticky). The tooltip
 * reads the live aria-label so it always matches the button's state.
 */
interface TooltipApi {
  show(text: string, anchor: DOMRect): void;
  hide(): void;
}
const TooltipContext = createContext<TooltipApi | null>(null);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const timer = useRef(0);
  const api = useMemo<TooltipApi>(
    () => ({
      show(text, r) {
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          setTip({ text, x: r.left + r.width / 2, y: r.bottom + 6 });
        }, 130);
      },
      hide() {
        clearTimeout(timer.current);
        setTip(null);
      },
    }),
    [],
  );
  return (
    <TooltipContext.Provider value={api}>
      {children}
      <TooltipBubble tip={tip} />
    </TooltipContext.Provider>
  );
}

function TooltipBubble({ tip }: { tip: { text: string; x: number; y: number } | null }) {
  const ref = useRef<HTMLDivElement>(null);
  // Clamp inside the viewport once we know our width.
  const w = ref.current?.offsetWidth ?? 0;
  const left = tip ? Math.max(6, Math.min(tip.x - w / 2, window.innerWidth - w - 6)) : 0;
  return (
    <div
      ref={ref}
      role="tooltip"
      className={"tooltip" + (tip ? " show" : "")}
      hidden={!tip}
      style={{ left, top: tip?.y ?? 0 }}
    >
      {tip?.text}
    </div>
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; armed?: boolean };

export function FloatButton({ label, armed, className, children, ...rest }: Props) {
  const tooltip = useContext(TooltipContext);
  const onEnter = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType !== "mouse") return;
      tooltip?.show(label, e.currentTarget.getBoundingClientRect());
    },
    [label, tooltip],
  );
  const hide = useCallback(() => tooltip?.hide(), [tooltip]);
  return (
    <button
      type="button"
      aria-label={label}
      className={["floatBtn", armed ? "armed" : "", className ?? ""].join(" ").trim()}
      onPointerEnter={onEnter}
      onPointerLeave={hide}
      onPointerDown={hide}
      {...rest}
    >
      {children}
    </button>
  );
}
