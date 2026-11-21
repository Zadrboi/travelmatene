"use client";
import { SEASONALITY } from "@/lib/data";
import { cn } from "@/lib/utils";

function crowdColor(v: number): string {
  if (v <= 3) return "bg-status-verified/25 text-status-verified border border-status-verified/30";
  if (v <= 6) return "bg-status-amber/25 text-status-amber border border-status-amber/30";
  return "bg-status-danger/25 text-status-danger border border-status-danger/30";
}

export default function SeasonalityHeatmap() {
  return (
    <section className="space-y-4" aria-labelledby="season-heading">
      <div>
        <h2 id="season-heading" className="font-headline-md text-headline-md text-[var(--text-ink)]">
          Crowd Index by State & Month
        </h2>
        <p className="font-body-sm text-body-sm text-[var(--text-muted)]">
          0 = empty, 10 = peak crowd. Best travel windows in green. High-contrast indicators for 8 states × 12 months.
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-center min-w-[640px]" aria-label="Seasonal crowd index heatmap">
          <thead>
            <tr>
              <th className="font-label-caps text-label-caps text-[var(--text-muted)] text-left pr-4 pb-3 uppercase">
                State
              </th>
              {SEASONALITY.months.map(m => (
                <th key={m} className="font-label-caps text-[10px] text-[var(--text-muted)] uppercase pb-3 w-8">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]/40">
            {SEASONALITY.states.map((state, si) => (
              <tr key={state} className="hover:bg-[var(--bg-editorial)]/40 transition-colors">
                <td className="font-data-tabular text-data-tabular text-[var(--text-ink)] font-medium pr-4 py-2 text-left whitespace-nowrap">
                  {state}
                </td>
                {SEASONALITY.data[si].map((v, mi) => (
                  <td key={mi} className="py-2 px-1">
                    <div
                      className={cn(
                        "rounded-md text-[10px] font-bold w-7 h-7 mx-auto flex items-center justify-center font-data-tabular shadow-sm",
                        crowdColor(v)
                      )}
                      title={`${state} in ${SEASONALITY.months[mi]}: ${v}/10 Crowd`}
                    >
                      {v}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-[var(--border-hairline)] font-label-caps text-[11px] uppercase text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-status-verified/25 border border-status-verified/40" />
            Low Crowd (0–3) — Ideal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-status-amber/25 border border-status-amber/40" />
            Moderate (4–6)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-status-danger/25 border border-status-danger/40" />
            Peak (7–10) — Pre-book
          </span>
        </div>
      </div>
    </section>
  );
}
