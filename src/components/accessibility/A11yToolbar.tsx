"use client";
import { useState } from "react";
import { useMotion } from "@/context/MotionPreferenceContext";
import { cn } from "@/lib/utils";

export default function A11yToolbar() {
  const { fontScale, setFontScale, highContrast, setHighContrast, prefersReducedMotion } = useMotion();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-editorial)] hover:text-[var(--text-ink)] transition-colors"
        aria-label="Accessibility Preferences"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="material-symbols-outlined text-[18px]">accessibility_new</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-label="Accessibility preferences"
            className="absolute right-0 top-10 z-50 w-64 bg-[var(--bg-surface)] text-[var(--text-ink)] rounded-xl shadow-card border border-[var(--border-hairline)] p-4 space-y-4"
          >
            {/* Font Scale */}
            <div>
              <p className="font-label-caps text-label-caps text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Text Size
              </p>
              <div className="flex items-center gap-2">
                {(["sm", "base", "lg"] as const).map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setFontScale(s)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg font-semibold transition-colors text-sm border",
                      fontScale === s
                        ? "bg-brand-pine text-white border-brand-pine"
                        : "bg-[var(--bg-canvas)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:bg-[var(--bg-editorial)]"
                    )}
                  >
                    {["A−", "A", "A+"][i]}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-body-sm text-body-sm text-[var(--text-ink)]">High Contrast</span>
              <button
                role="switch"
                aria-checked={highContrast}
                onClick={() => setHighContrast(!highContrast)}
                className={cn(
                  "relative w-10 h-6 rounded-full transition-colors",
                  highContrast ? "bg-brand-pine" : "bg-[var(--border-hairline)]"
                )}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  highContrast ? "translate-x-5" : "translate-x-1"
                )} />
              </button>
            </label>

            {/* Reduce Motion — read-only OS pref indicator */}
            <div className="flex items-center justify-between border-t border-[var(--border-hairline)] pt-3">
              <span className="font-body-sm text-body-sm text-[var(--text-ink)]">Reduce Motion</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full font-badge-gov text-badge-gov uppercase",
                prefersReducedMotion ? "bg-status-verified/15 text-status-verified" : "bg-[var(--bg-editorial)] text-[var(--text-muted)]"
              )}>
                {prefersReducedMotion ? "Active (OS)" : "Off"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
