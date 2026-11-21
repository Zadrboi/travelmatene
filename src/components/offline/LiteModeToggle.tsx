"use client";
import { useMotion } from "@/context/MotionPreferenceContext";

export default function LiteModeToggle({ className = "" }: { className?: string }) {
  const { isLiteMode, setLiteMode } = useMotion();
  return (
    <button
      onClick={() => setLiteMode(!isLiteMode)}
      className={`hidden lg:flex items-center px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-ink)] hover:bg-[var(--bg-editorial)] font-badge-gov text-badge-gov uppercase transition-colors shadow-sm ${className}`}
      aria-label={isLiteMode ? "Disable Lite Mode" : "Enable Lite Mode (Data Saver)"}
      aria-pressed={isLiteMode}
    >
      <span className={`w-2 h-2 rounded-full mr-1.5 ${isLiteMode ? "bg-status-verified" : "bg-surface-tint"}`} />
      Lite: {isLiteMode ? "On" : "Off"}
    </button>
  );
}
