"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface MotionPreference {
  isLiteMode: boolean;
  setLiteMode: (v: boolean) => void;
  prefersReducedMotion: boolean;
  isOffline: boolean;
  fontScale: "sm" | "base" | "lg";
  setFontScale: (v: "sm" | "base" | "lg") => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
}

const Ctx = createContext<MotionPreference>({
  isLiteMode: false,          setLiteMode: () => {},
  prefersReducedMotion: false, isOffline: false,
  fontScale: "base",          setFontScale: () => {},
  highContrast: false,        setHighContrast: () => {},
});

export function MotionPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [isLiteMode, setLiteModeState] = useState(false);
  const [prefersReducedMotion, setPRM] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [fontScale, setFontScaleState] = useState<"sm" | "base" | "lg">("base");
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    // Reduced-motion media query
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPRM(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPRM(e.matches);
    mq.addEventListener("change", handler);

    // Online / Offline
    setIsOffline(!navigator.onLine);
    const onOffline = () => setIsOffline(true);
    const onOnline  = () => setIsOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online",  onOnline);

    // Restore persisted prefs
    const stored = localStorage.getItem("travelmate-prefs");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        if (p.isLiteMode)   setLiteModeState(p.isLiteMode);
        if (p.fontScale)    setFontScaleState(p.fontScale);
        if (p.highContrast) setHighContrastState(p.highContrast);
      } catch {}
    }

    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online",  onOnline);
    };
  }, []);

  // Sync data-lite attribute for CSS kill-switch
  useEffect(() => {
    document.body.dataset.lite = String(isLiteMode);
    if (fontScale === "sm") document.documentElement.style.fontSize = "14px";
    else if (fontScale === "lg") document.documentElement.style.fontSize = "18px";
    else document.documentElement.style.fontSize = "";
    if (highContrast) document.documentElement.classList.add("high-contrast");
    else document.documentElement.classList.remove("high-contrast");
  }, [isLiteMode, fontScale, highContrast]);

  const setLiteMode = (v: boolean) => {
    setLiteModeState(v);
    persist({ isLiteMode: v, fontScale, highContrast });
  };
  const setFontScale = (v: "sm" | "base" | "lg") => {
    setFontScaleState(v);
    persist({ isLiteMode, fontScale: v, highContrast });
  };
  const setHighContrast = (v: boolean) => {
    setHighContrastState(v);
    persist({ isLiteMode, fontScale, highContrast: v });
  };

  function persist(prefs: object) {
    localStorage.setItem("travelmate-prefs", JSON.stringify(prefs));
  }

  return (
    <Ctx.Provider value={{ isLiteMode, setLiteMode, prefersReducedMotion, isOffline, fontScale, setFontScale, highContrast, setHighContrast }}>
      {children}
    </Ctx.Provider>
  );
}

export const useMotion = () => useContext(Ctx);
