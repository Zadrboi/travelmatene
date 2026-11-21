import BudgetComparisonChart from "@/components/analytics/BudgetComparisonChart";
import SeasonalityHeatmap from "@/components/analytics/SeasonalityHeatmap";

export const metadata = { title: "Public Tourism Insights | TravelMateNE" };

export default function InsightsPage() {
  return (
    <div className="pt-[112px] min-h-screen bg-[var(--bg-canvas)] pb-20 md:pb-8">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 py-12 space-y-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-accent-terracotta font-label-caps text-label-caps uppercase tracking-widest font-semibold">
            <span className="material-symbols-outlined text-[16px]">bar_chart</span>
            Open Public Data Matrix
          </div>
          <h1 className="font-editorial text-4xl lg:text-5xl text-[var(--text-ink)]" style={{ fontOpticalSizing: "none" }}>
            Public Tourism Insights Dashboard
          </h1>
          <p className="font-body-lg text-body-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
            State-wise ₹ cost benchmarks, seasonal crowd patterns, and connectivity index across all 8 Sister States. Sourced from DoNER, state tourism boards, and district transit councils.
          </p>
        </div>

        {/* Offline resilience callout */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">wifi_off</span>
          </div>
          <div>
            <p className="font-label-caps text-label-caps uppercase text-[var(--text-ink)] font-bold">
              Connectivity & Offline Need Index
            </p>
            <p className="font-body-sm text-body-sm text-[var(--text-muted)] mt-0.5 leading-relaxed">
              High-altitude passes (Tawang, Dzukou Valley, Phawngpui) have patchy or zero cellular coverage. TravelMateNE caches all permit rules, routes, and emergency contacts offline in IndexedDB.
            </p>
          </div>
        </div>

        <BudgetComparisonChart />
        <SeasonalityHeatmap />
      </div>
    </div>
  );
}
