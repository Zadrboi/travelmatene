"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import PlaceCard from "@/components/explore/PlaceCard";
import LiteModeToggle from "@/components/offline/LiteModeToggle";
import { PLACES, NE_STATES, type NEState } from "@/lib/data";
import { DESTINATIONS } from "@/data/destinations";

const InteractiveMap = dynamic(() => import("@/components/explore/InteractiveMap"), { ssr: false });

function ExploreContent() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const budgetParam = searchParams.get("budget") || "";
  const stateParam = searchParams.get("state") || "";

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [budgetTier, setBudgetTier] = useState(budgetParam);
  const [selectedState, setSelectedState] = useState<NEState | "All">(
    stateParam && NE_STATES.includes(stateParam as NEState) ? (stateParam as NEState) : "All"
  );
  const [permit, setPermit] = useState<string>("All");
  const [view, setView] = useState<"grid" | "map">("grid");

  // Keep state in sync with URL searchParams
  useEffect(() => {
    setSearchQuery(qParam);
    setBudgetTier(budgetParam);
    if (stateParam && NE_STATES.includes(stateParam as NEState)) {
      setSelectedState(stateParam as NEState);
    }
  }, [qParam, budgetParam, stateParam]);

  // Lookup map for fast multi-field search against rich destination metadata
  const destLookup = useMemo(() => {
    return new Map(DESTINATIONS.map((d) => [d.slug, d]));
  }, []);

  const filtered = useMemo(() => {
    return PLACES.filter((p) => {
      // 1. State filter
      if (selectedState !== "All" && p.state !== selectedState) return false;

      // 2. Permit filter
      if (permit !== "All" && p.permit !== permit) return false;

      // 3. Budget tier filter
      if (budgetTier) {
        const b = budgetTier.toLowerCase();
        if (b === "budget" || b.includes("1,200") || b.includes("1200")) {
          if (p.costPerDay > 2000) return false;
        } else if (b === "mid" || b.includes("2,000") || b.includes("2000") || b.includes("homestay")) {
          if (p.costPerDay < 1500 || p.costPerDay > 3500) return false;
        } else if (b === "comfort" || b.includes("3,500") || b.includes("3500") || b.includes("4x4")) {
          if (p.costPerDay < 3000) return false;
        }
      }

      // 4. Case-insensitive query across name, state, district, category, highlights & circuits
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const segments = q.split(/[\s–—-]+/).filter((s) => s.length > 2);
        const meta = destLookup.get(p.slug);

        const searchCorpus = [
          p.name,
          p.state,
          p.tagline,
          p.hub,
          p.slug,
          meta?.category,
          meta?.summary,
          meta?.nearestHub,
          ...(meta?.highlights || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const directMatch = searchCorpus.includes(q);
        const circuitMatch =
          segments.length > 1 && segments.some((seg) => searchCorpus.includes(seg));

        if (!directMatch && !circuitMatch) return false;
      }

      return true;
    });
  }, [selectedState, permit, budgetTier, searchQuery, destLookup]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || budgetTier || selectedState !== "All" || permit !== "All"
  );

  const clearAllFilters = () => {
    setSearchQuery("");
    setBudgetTier("");
    setSelectedState("All");
    setPermit("All");
    window.history.replaceState(null, "", "/explore");
  };

  return (
    <div className="pt-[108px] min-h-screen bg-bg-canvas pb-20 md:pb-8">
      {/* Sticky Filter Bar */}
      <div className="sticky top-[108px] z-20 bg-bg-canvas/95 backdrop-blur border-b border-border-hairline shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left inputs */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--text-muted)] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circuit, state, or destination..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface-container font-body-sm text-body-sm text-[var(--text-ink)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-brand-pine border border-[var(--border-hairline)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-ink)] text-sm"
                  aria-label="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>

            {/* State Select */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value as NEState | "All")}
              className="px-3 py-2 rounded-lg bg-surface-container font-body-sm text-body-sm text-[var(--text-ink)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-brand-pine cursor-pointer"
              aria-label="Filter by state"
            >
              <option value="All">All 8 States</option>
              {NE_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Permit Select */}
            <select
              value={permit}
              onChange={(e) => setPermit(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-container font-body-sm text-body-sm text-[var(--text-ink)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-brand-pine cursor-pointer"
              aria-label="Filter by permit type"
            >
              <option value="All">All Permits</option>
              <option value="open">Permit-Free</option>
              <option value="ilp">ILP Required</option>
              <option value="pap">PAP Required</option>
            </select>

            {/* Budget Select */}
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-container font-body-sm text-body-sm text-[var(--text-ink)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-brand-pine cursor-pointer"
              aria-label="Filter by budget"
            >
              <option value="">All Budgets</option>
              <option value="budget">Under ₹2,000 / day</option>
              <option value="mid">₹2,000 – ₹3,500 / day</option>
              <option value="comfort">₹3,500+ / day</option>
            </select>
          </div>

          {/* Right utilities: View toggle & Lite Mode */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={`px-3 py-1.5 rounded-lg font-label-caps text-label-caps uppercase transition-colors flex items-center gap-1 ${
                view === "grid"
                  ? "bg-brand-pine text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-editorial)]"
              }`}
              title="Grid view"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className={`px-3 py-1.5 rounded-lg font-label-caps text-label-caps uppercase transition-colors flex items-center gap-1 ${
                view === "map"
                  ? "bg-brand-pine text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-editorial)]"
              }`}
              title="Interactive map view"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              <span className="hidden sm:inline">Map</span>
            </button>
            <LiteModeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 py-8 space-y-6">
        {/* Active Filter Summary Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-body-sm">
              <span className="font-semibold text-[var(--text-ink)]">
                Showing {filtered.length} matching destinations
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-terracotta/10 text-accent-terracotta border border-accent-terracotta/20 text-xs font-medium">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:opacity-75 font-bold"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedState !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-pine/10 text-brand-pine dark:text-primary-fixed border border-brand-pine/20 text-xs font-medium">
                  <span>State: {selectedState}</span>
                  <button
                    onClick={() => setSelectedState("All")}
                    className="hover:opacity-75 font-bold"
                    aria-label="Remove state filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {permit !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-tint/10 text-surface-tint border border-surface-tint/20 text-xs font-medium">
                  <span>Permit: {permit.toUpperCase()}</span>
                  <button
                    onClick={() => setPermit("All")}
                    className="hover:opacity-75 font-bold"
                    aria-label="Remove permit filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {budgetTier && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed/30 text-[var(--text-ink)] border border-[var(--border-hairline)] text-xs font-medium">
                  <span>Budget: {budgetTier}</span>
                  <button
                    onClick={() => setBudgetTier("")}
                    className="hover:opacity-75 font-bold"
                    aria-label="Remove budget filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="font-label-caps text-label-caps uppercase text-accent-terracotta hover:underline font-bold text-xs cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Content View: Grid or Map */}
        {view === "grid" ? (
          <>
            <div className="flex items-center justify-between">
              <p className="font-label-caps text-label-caps text-[var(--text-muted)] uppercase tracking-wider">
                {filtered.length} {filtered.length === 1 ? "Destination" : "Destinations"} Available
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 space-y-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-hairline)] p-8">
                <div className="w-12 h-12 rounded-xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[24px]">search_off</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline-sm text-lg font-semibold text-[var(--text-ink)]">
                    No destinations match your criteria
                  </h3>
                  <p className="font-body-md text-sm text-[var(--text-muted)] max-w-md mx-auto">
                    Try searching for broader keywords, clearing specific state or permit filters, or exploring all 32 curated circuits.
                  </p>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 rounded-xl bg-brand-pine text-white font-label-caps text-label-caps uppercase tracking-wider hover:bg-brand-pine/80 transition-colors shadow-sm"
                >
                  View All 32 Destinations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((p, i) => (
                  <PlaceCard key={p.id} place={p} priority={i < 4} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-[640px] rounded-2xl overflow-hidden shadow-card border border-[var(--border-hairline)]">
            <InteractiveMap places={filtered} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="pt-[108px] min-h-screen bg-bg-canvas flex items-center justify-center">
          <div className="flex items-center gap-2.5 text-[var(--text-muted)]">
            <span className="material-symbols-outlined text-[20px] animate-spin text-accent-terracotta">
              progress_activity
            </span>
            <span className="font-label-caps text-label-caps uppercase">Loading field directory...</span>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
