"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CheckItem { id: string; label: string; detail?: string; }

const ITEMS: CheckItem[] = [
  { id: "ilp",      label: "ILP / PAP application submitted",         detail: "Apply online. Keep PDF printout — checkpoints require paper copies." },
  { id: "photo",    label: "2× passport-size photographs",             detail: "Some DC offices still require physical photos even for online permits." },
  { id: "id",       label: "Government photo ID (original + 2 copies)", detail: "Aadhaar, Passport, or Voter ID. OCI card for foreign nationals." },
  { id: "vehicle",  label: "Vehicle Permit (if driving own vehicle)",   detail: "Required at all ILP checkpoints for private or rented vehicles." },
  { id: "insurance", label: "Travel insurance covering high-altitude areas" },
  { id: "cash",      label: "₹8,000–₹12,000 cash for 7-day NE circuit", detail: "ATMs are sparse beyond district HQ. Carry Canara / SBI cards (widest network)." },
  { id: "offline",  label: "Offline maps & itinerary downloaded",       detail: "Cache this app as PWA before you leave cellular range." },
  { id: "emergency", label: "Emergency contacts — NDRF, BRO hotline"    },
];

export default function DocumentChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const pct = Math.round((checked.size / ITEMS.length) * 100);

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-label-caps text-label-caps uppercase text-text-muted">
          <span>Checklist Progress</span>
          <span className="text-status-verified font-bold">{pct}%</span>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-status-verified rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
            role="progressbar" aria-valuenow={pct} aria-valuemax={100}
          />
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-2" role="list">
        {ITEMS.map(item => {
          const done = checked.has(item.id);
          return (
            <li key={item.id}>
              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-surface-container transition-colors">
                <div
                  className={cn(
                    "mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors",
                    done ? "bg-status-verified border-status-verified" : "border-border-hairline bg-bg-surface"
                  )}
                  onClick={() => toggle(item.id)}
                >
                  {done && (
                    <svg viewBox="0 0 12 10" className="w-3 h-3" aria-hidden>
                      <path
                        d="M1.5 5l3 3 6-6"
                        stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
                        pathLength="1"
                        className="svg-check drawn"
                      />
                    </svg>
                  )}
                  <input type="checkbox" checked={done} onChange={() => toggle(item.id)} className="sr-only" />
                </div>
                <div>
                  <p className={cn("font-body-sm text-body-sm transition-colors", done ? "line-through text-text-muted" : "text-text-ink")}>
                    {item.label}
                  </p>
                  {item.detail && (
                    <p className="font-body-sm text-[12px] text-text-subtle mt-0.5">{item.detail}</p>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {/* Save trigger */}
      {pct === 100 && (
        <div className="rounded-xl bg-status-verified/10 border border-status-verified/20 p-4 text-center space-y-2">
          <span className="material-symbols-outlined text-[28px] text-status-verified">check_circle</span>
          <p className="font-headline-sm text-headline-sm text-status-verified">All documents ready.</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-status-verified text-white font-label-caps text-label-caps uppercase">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Save PDF / Offline
          </button>
        </div>
      )}
    </div>
  );
}
