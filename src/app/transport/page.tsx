"use client";
import { useState } from "react";
import { TRANSPORT_ROUTES } from "@/lib/data";
import { formatINR } from "@/lib/utils";

const MODE_ICONS: Record<string, string> = {
  "shared-sumo":  "directions_bus",
  "force-winger": "airport_shuttle",
  "train":        "train",
  "flight":       "flight",
};

export default function TransportPage() {
  const [mode, setMode] = useState("all");
  const [from, setFrom] = useState("");

  const filtered = TRANSPORT_ROUTES.filter(r => {
    if (mode !== "all" && r.mode !== mode) return false;
    if (from && !r.from.toLowerCase().includes(from.toLowerCase()) && !r.to.toLowerCase().includes(from.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pt-[112px] min-h-screen bg-bg-canvas pb-20 md:pb-8">
      <div className="max-w-[1280px] mx-auto px-8 py-12 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-terracotta font-label-caps text-label-caps uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">directions_bus</span>
            Verified Mountain Transit
          </div>
          <h1 className="font-editorial text-4xl lg:text-5xl text-[var(--text-ink)]" style={{ fontOpticalSizing: "none" }}>
            Shared Transport & Fare Directory
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted max-w-2xl">
            Shared Tata Sumo, Force Winger, train, and air connections. Market fares, hubs, and frequencies updated from district transit boards.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Search origin or destination…"
            className="px-4 py-2 rounded-lg bg-surface-container font-body-sm text-body-sm text-text-ink focus:outline-none focus:ring-2 focus:ring-brand-pine w-64" />
          {["all", "shared-sumo", "force-winger", "train", "flight"].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-wider transition-colors ${mode === m ? "bg-brand-pine text-white" : "bg-surface-container text-text-muted hover:bg-surface-container-high"}`}>
              {m === "all" ? "All Modes" : m.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Route table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden">
          <table className="w-full" role="table">
            <thead className="bg-surface-container">
              <tr>
                {["Route", "Mode", "Fare", "Duration", "Hub", "Frequency"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-label-caps text-label-caps uppercase text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-border-hairline hover:bg-surface-container transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-body-sm text-body-sm text-text-ink font-semibold">{r.from}</p>
                    <p className="font-label-caps text-[9px] uppercase text-text-muted">→ {r.to}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-badge-gov text-badge-gov uppercase text-text-muted">
                      <span className="material-symbols-outlined text-[14px]">{MODE_ICONS[r.mode]}</span>
                      {r.mode.replace("-", " ")}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-data-tabular text-data-tabular text-accent-terracotta font-bold">{formatINR(r.fareINR)}</td>
                  <td className="px-4 py-3 font-data-tabular text-data-tabular text-text-ink">{Math.floor(r.durationMin / 60)}h {r.durationMin % 60}m</td>
                  <td className="px-4 py-3 font-body-sm text-[12px] text-text-muted">{r.hub}</td>
                  <td className="px-4 py-3 font-body-sm text-[12px] text-text-muted">{r.frequency}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center font-body-sm text-body-sm text-text-muted">No routes match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
