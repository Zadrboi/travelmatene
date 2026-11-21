"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLACES, NE_STATES, PERMITS } from "@/lib/data";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

type Result = { type: "place" | "state" | "permit" | "route"; label: string; sub: string; href: string; };

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); if (!open) return; }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onClose]);

  const results: Result[] = query.length < 2 ? [] : [
    ...PLACES.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.state.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5).map(p => ({
      type: "place" as const,
      label: p.name,
      sub: `${p.state} · ₹${p.costPerDay.toLocaleString("en-IN")}/day`,
      href: `/explore/${encodeURIComponent(p.state.toLowerCase().replace(/ /g, "-"))}/${p.slug}`,
    })),
    ...NE_STATES.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(s => ({
      type: "state" as const,
      label: s,
      sub: "Browse destinations",
      href: `/explore?state=${encodeURIComponent(s)}`,
    })),
    ...PERMITS.filter(p => p.state.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(p => ({
      type: "permit" as const,
      label: `${p.state} — ${p.type.toUpperCase()} Info`,
      sub: `${p.fee} · ${p.validity}`,
      href: "/permits",
    })),
  ];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl bg-bg-surface rounded-2xl shadow-card overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-hairline">
          <span className="material-symbols-outlined text-[20px] text-text-muted">search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search states, destinations, permit rules, routes…"
            className="flex-1 bg-transparent font-body-md text-body-md text-text-ink placeholder:text-text-subtle focus:outline-none"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded bg-surface-container-low text-text-muted font-data-tabular text-[11px]">ESC</kbd>
        </div>
        {results.length > 0 ? (
          <ul className="py-2 max-h-80 overflow-y-auto">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => { router.push(r.href); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-surface-tint shrink-0">
                    {r.type === "place" ? "location_on" : r.type === "state" ? "map" : r.type === "permit" ? "policy" : "directions_bus"}
                  </span>
                  <div>
                    <p className="font-body-sm text-body-sm text-text-ink font-semibold">{r.label}</p>
                    <p className="font-data-tabular text-[11px] text-text-muted">{r.sub}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : query.length >= 2 ? (
          <p className="px-4 py-6 text-center font-body-sm text-body-sm text-text-muted">No results for "{query}"</p>
        ) : (
          <div className="px-4 py-4 space-y-1">
            <p className="font-label-caps text-label-caps text-text-subtle uppercase tracking-wider mb-3">Quick actions</p>
            {[
              { icon: "policy", label: "Check ILP Eligibility", href: "/permits/checker" },
              { icon: "bar_chart", label: "Tourism Insights Dashboard", href: "/insights" },
              { icon: "explore", label: "Explore All 8 States", href: "/explore" },
            ].map(a => (
              <button key={a.href} onClick={() => { router.push(a.href); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left transition-colors">
                <span className="material-symbols-outlined text-[18px] text-accent-terracotta">{a.icon}</span>
                <span className="font-body-sm text-body-sm text-text-ink">{a.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
