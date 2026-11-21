"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMotion } from "@/context/MotionPreferenceContext";

interface FlipState {
  fromRect: DOMRect | null;
  imageUrl: string;
  slug: string;
}

interface FlipCtx {
  triggerFlip: (rect: DOMRect, imageUrl: string, href: string) => void;
  flipState: FlipState | null;
  clearFlip: () => void;
}

const Ctx = createContext<FlipCtx>({ triggerFlip: () => {}, flipState: null, clearFlip: () => {} });

export function FlipTransitionProvider({ children }: { children: React.ReactNode }) {
  const [flipState, setFlipState] = useState<FlipState | null>(null);
  const router = useRouter();
  const { prefersReducedMotion, isLiteMode } = useMotion();
  const reduced = prefersReducedMotion || isLiteMode;

  const triggerFlip = useCallback((rect: DOMRect, imageUrl: string, href: string) => {
    if (reduced) {
      router.push(href);
      return;
    }
    setFlipState({ fromRect: rect, imageUrl, slug: href });
    router.push(href);
  }, [router, reduced]);

  const clearFlip = useCallback(() => setFlipState(null), []);

  return (
    <Ctx.Provider value={{ triggerFlip, flipState, clearFlip }}>
      {children}
      {/* Fixed portal clone — renders during route transition */}
      {flipState?.fromRect && !reduced && (
        <FlipClone state={flipState} onDone={clearFlip} />
      )}
    </Ctx.Provider>
  );
}

function FlipClone({ state, onDone }: { state: FlipState; onDone: () => void }) {
  const { fromRect, imageUrl } = state;
  const [active, setActive] = useState(false);

  useEffect(() => {
    let r2: number;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setActive(true);
      });
    });

    const timer = setTimeout(() => {
      onDone();
    }, 550);

    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
      clearTimeout(timer);
    };
  }, [onDone]);

  if (!fromRect) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    pointerEvents: "none",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
    transition: active ? "all 480ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
    top: active ? 0 : fromRect.top,
    left: active ? 0 : fromRect.left,
    width: active ? "100vw" : `${fromRect.width}px`,
    height: active ? "420px" : `${fromRect.height}px`,
    borderRadius: active ? "0px" : "12px",
    opacity: active ? 0.95 : 1,
  };

  return (
    <div style={style} className="pointer-events-none" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
    </div>
  );
}

export const useFlip = () => useContext(Ctx);
