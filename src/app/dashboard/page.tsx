import { PLACES } from "@/lib/data";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "My Dashboard | TravelMateNE" };

const MOCK_TRIPS = [
  { id: "1", name: "Meghalaya Explorer Circuit", dates: "Dec 14–21, 2025", status: "Planning", cached: true,  budget: 11200, spent: 3400 },
  { id: "2", name: "Tawang Monastery Trek",      dates: "Jan 05–12, 2026", status: "Permit Pending", cached: false, budget: 18500, spent: 150 },
];

const BOOKMARKED = PLACES.filter(p => ["kaziranga-national-park", "nongriat-double-decker-root-bridge"].includes(p.slug));

export default function DashboardPage() {
  return (
    <div className="pt-[112px] min-h-screen bg-[var(--bg-canvas)] pb-20 md:pb-8">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 py-12 space-y-10">
        <div className="space-y-1">
          <h1 className="font-editorial text-4xl text-[var(--text-ink)]" style={{ fontOpticalSizing: "none" }}>My Dashboard</h1>
          <p className="font-body-md text-body-md text-[var(--text-muted)]">Your saved trips, offline documents, and bookmarked destinations.</p>
        </div>

        {/* Saved Trips */}
        <section aria-labelledby="trips-heading">
          <h2 id="trips-heading" className="font-headline-md text-headline-md text-[var(--text-ink)] mb-4">Saved Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_TRIPS.map(trip => (
              <div key={trip.id} className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card border border-[var(--border-hairline)] space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-[var(--text-ink)]">{trip.name}</h3>
                    <p className="font-body-sm text-body-sm text-[var(--text-muted)]">{trip.dates}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-badge-gov text-badge-gov uppercase px-2 py-0.5 rounded-full bg-status-amber/15 text-status-amber">{trip.status}</span>
                    {trip.cached && (
                      <span className="font-badge-gov text-badge-gov uppercase px-2 py-0.5 rounded-full bg-status-verified/15 text-status-verified flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">offline_pin</span>
                        Offline Cached ✓
                      </span>
                    )}
                  </div>
                </div>
                {/* Budget tracker */}
                <div>
                  <div className="flex justify-between font-label-caps text-label-caps uppercase text-[var(--text-muted)] mb-1">
                    <span>Trip Budget</span>
                    <span>{formatINR(trip.spent)} / {formatINR(trip.budget)}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-editorial)] rounded-full overflow-hidden">
                    <div className="h-full bg-accent-terracotta rounded-full transition-all" style={{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bookmarked Places */}
        <section aria-labelledby="bookmarks-heading">
          <h2 id="bookmarks-heading" className="font-headline-md text-headline-md text-[var(--text-ink)] mb-4">Bookmarked Places</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOOKMARKED.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-[var(--bg-surface)] rounded-2xl p-4 shadow-card border border-[var(--border-hairline)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="font-headline-sm text-[14px] text-[var(--text-ink)] truncate font-semibold">{p.name}</p>
                  <p className="font-body-sm text-body-sm text-[var(--text-muted)]">{p.state}</p>
                  <p className="font-data-tabular text-data-tabular text-accent-terracotta font-bold">{formatINR(p.costPerDay)}/day</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
