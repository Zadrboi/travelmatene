"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TRAVELER_TYPES = [
  { id: "solo",        icon: "hiking",        label: "Solo Backpacker",    desc: "Shared dorms, Sumo hops, flexible ILP. Max terrain per rupee." },
  { id: "family",      icon: "family_restroom",label: "Family / Group",    desc: "Private cabs, council homestays, pre-booked permits for groups." },
  { id: "international",icon: "travel_explore", label: "International / OCI",desc: "PAP / RAP guidance, embassy-verified permit checklist, forex tips." },
  { id: "adventure",   icon: "terrain",        label: "Adventure & Passes", desc: "High-altitude treks, BRO route advisories, Dzukou / Sandakphu circuits." },
];

export default function OnboardingModal({ onDone }: { onDone: (type: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal aria-label="Choose your traveler type">
      <div className="w-full max-w-lg bg-bg-surface rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border-hairline">
          <p className="font-label-caps text-label-caps text-accent-terracotta uppercase tracking-widest mb-1">Welcome to TravelMateNE</p>
          <h2 className="font-editorial text-2xl text-brand-pine" style={{ fontOpticalSizing: "none" }}>How are you travelling?</h2>
          <p className="font-body-sm text-body-sm text-text-muted mt-1">We'll personalise permit rules, fare estimates, and circuit recommendations for you.</p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3">
          {TRAVELER_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all space-y-2",
                selected === t.id
                  ? "border-accent-terracotta bg-accent-terracotta/5"
                  : "border-border-hairline hover:border-brand-pine/30 hover:bg-surface-container"
              )}
            >
              <span className={cn("material-symbols-outlined text-[26px]", selected === t.id ? "text-accent-terracotta" : "text-brand-pine")}>{t.icon}</span>
              <p className="font-headline-sm text-[14px] text-brand-pine">{t.label}</p>
              <p className="font-body-sm text-body-sm text-text-muted leading-snug">{t.desc}</p>
            </button>
          ))}
        </div>
        <div className="px-6 pb-6">
          <button
            disabled={!selected}
            onClick={() => selected && onDone(selected)}
            className="w-full py-3 rounded-xl bg-brand-pine text-white font-label-caps text-label-caps uppercase tracking-wider disabled:opacity-40 hover:bg-brand-pine/80 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
