"use client";
import { useEffect, useState } from "react";
import { useMotion } from "@/context/MotionPreferenceContext";

export default function OfflineBanner() {
  const { isOffline, isLiteMode, setLiteMode } = useMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const show = mounted && (isOffline || isLiteMode);

  return (
    <div
      aria-live="polite"
      className={`fixed top-[112px] left-0 right-0 z-30 transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      {show && (
        <div
          onClick={() => {
            if (!isOffline && isLiteMode) setLiteMode(false);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-4 font-label-caps text-label-caps uppercase tracking-wider text-white shadow-sm select-none ${
            isOffline ? "bg-status-danger" : "bg-brand-pine cursor-pointer hover:bg-brand-pine/90"
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isOffline ? "wifi_off" : "data_saver_on"}
          </span>
          <span>
            {isOffline
              ? "You are offline — cached data shown. Permit portals unavailable."
              : "Lite Mode active — heavy assets collapsed. Tap to disable."}
          </span>
        </div>
      )}
    </div>
  );
}
