"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { BUDGET_DATA } from "@/lib/data";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 shadow-lg text-[var(--text-ink)] text-xs space-y-1.5 min-w-[150px]">
      <p className="font-semibold text-sm border-b border-[var(--border-hairline)] pb-1 text-[var(--text-ink)]">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)] font-medium">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}:
          </span>
          <span className="font-data-tabular font-bold text-[var(--text-ink)]">
            ₹{entry.value?.toLocaleString("en-IN")}/day
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BudgetComparisonChart() {
  return (
    <section className="space-y-4" aria-labelledby="budget-chart-heading">
      <div>
        <h2 id="budget-chart-heading" className="font-headline-md text-headline-md text-[var(--text-ink)]">
          ₹/day Cost by State
        </h2>
        <p className="font-body-sm text-body-sm text-[var(--text-muted)]">
          Backpacker (Sumo + Dorm), Mid-Range (Homestay), and Comfort (Private 4×4 + Hotel) daily estimates.
        </p>
      </div>

      <div className="w-full bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card border border-[var(--border-hairline)]">
        <div className="h-[340px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={BUDGET_DATA} margin={{ top: 12, right: 12, left: -4, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
              <XAxis
                dataKey="state"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-hairline)" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `₹${v.toLocaleString("en-IN")}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px", color: "var(--text-muted)" }}
              />
              <Bar dataKey="budget"  name="Backpacker" fill="#34B37A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mid"     name="Mid-Range"   fill="#E0531F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comfort" name="Comfort"     fill="#4E7B67" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
