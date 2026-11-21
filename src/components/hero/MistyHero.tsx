"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMotion } from "@/context/MotionPreferenceContext";
import { HERO_SLIDES, NE_STATES } from "@/lib/data";
import { DESTINATIONS } from "@/data/destinations";
import { easeInOutCubic, cn } from "@/lib/utils";

const SLIDE_INTERVAL = 6000;
const WIPE_DURATION  = 1250;

const POPULAR_CIRCUITS = [
  "Guwahati–Kaziranga–Majuli",
  "Shillong–Dawki–Cherrapunji",
  "Bhalukpong–Tawang Corridor",
  "Dimapur–Kohima–Dzukou Valley",
  "Imphal–Moirang–Loktak Lake",
  "Gangtok–Nathula–Tsomgo Lake",
  "Aizawl–Thenzawl–Vantawng Falls",
  "Agartala–Unakoti Circuit",
];

export default function MistyHero() {
  const router = useRouter();
  const { prefersReducedMotion, isLiteMode } = useMotion();
  const reduced = prefersReducedMotion || isLiteMode;

  const [current, setCurrent] = useState(0);
  const [wiping,  setWiping]  = useState(false);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budgetTier, setBudgetTier] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const maskRef       = useRef<HTMLDivElement>(null);
  const slideImgRef   = useRef<HTMLImageElement>(null);
  const mistRef       = useRef<HTMLDivElement>(null);
  const cloudRef1     = useRef<HTMLDivElement>(null);
  const cloudRef2     = useRef<HTMLDivElement>(null);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef        = useRef<number>(0);
  const searchInputWrapperRef = useRef<HTMLDivElement>(null);

  // Instant autocomplete matching destinations, states, and circuits
  const suggestions = useMemo(() => {
    if (!destination || destination.trim().length < 1) return [];
    const q = destination.toLowerCase().trim();
    const results: { title: string; subtitle: string; type: "Destination" | "State" | "Circuit" }[] = [];

    // 1. Match states
    NE_STATES.forEach(s => {
      if (s.toLowerCase().includes(q)) {
        results.push({ title: s, subtitle: "8 Sister States Region", type: "State" });
      }
    });

    // 2. Match circuits
    POPULAR_CIRCUITS.forEach(c => {
      if (c.toLowerCase().includes(q)) {
        results.push({ title: c, subtitle: "Verified Multi-Stop Circuit", type: "Circuit" });
      }
    });

    // 3. Match destinations
    DESTINATIONS.forEach(d => {
      if (
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.nearestHub.toLowerCase().includes(q)
      ) {
        results.push({ title: d.name, subtitle: `${d.state} · ${d.category}`, type: "Destination" });
      }
    });

    return results.slice(0, 6);
  }, [destination]);

  // Handle outside click for autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchInputWrapperRef.current && !searchInputWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (date) params.set("date", date);
    if (travelers) params.set("travelers", String(travelers));
    if (budgetTier) params.set("budget", budgetTier);
    router.push(`/explore?${params.toString()}`);
  };

  const handleTrendingClick = (circuit: string) => {
    setDestination(circuit);
    setShowSuggestions(false);
    router.push(`/explore?q=${encodeURIComponent(circuit)}`);
  };

  // ── Misty right-to-left wipe rAF ──
  const runWipe = useCallback((nextIdx: number) => {
    if (wiping || reduced) {
      setCurrent(nextIdx);
      return;
    }
    setWiping(true);
    const start = performance.now();
    function frame(now: number) {
      const t = Math.min((now - start) / WIPE_DURATION, 1);
      const p = easeInOutCubic(t);
      if (maskRef.current) {
        const pct = p * 135;
        maskRef.current.style.maskImage =
          `linear-gradient(to left, black ${pct - 35}%, rgba(0,0,0,0.6) ${pct - 17.5}%, transparent ${pct}%)`;
        maskRef.current.style.webkitMaskImage = maskRef.current.style.maskImage;
      }
      // Traveling blurred mist band opacity & position
      const mistOpacity = Math.sin(Math.PI * t) * 0.9;
      const mistX       = p * 100;
      if (mistRef.current) {
        mistRef.current.style.opacity   = String(mistOpacity);
        mistRef.current.style.transform = `translateX(${mistX}vw)`;
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setCurrent(nextIdx);
        setWiping(false);
        if (maskRef.current) {
          maskRef.current.style.maskImage = "";
          maskRef.current.style.webkitMaskImage = "";
        }
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [wiping, reduced]);

  // Auto-advance
  useEffect(() => {
    if (reduced) return;
    function tick() {
      if (searchOpen) return;
      setCurrent(c => {
        const next = (c + 1) % HERO_SLIDES.length;
        runWipe(next);
        return c;
      });
    }
    intervalRef.current = setInterval(tick, SLIDE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, searchOpen, runWipe]);

  // Scroll choreography (slide translateY(+0.35 * scrollY), mist translateY(-0.3 * scrollY))
  useEffect(() => {
    if (reduced) return;
    function onScroll() {
      const y = window.scrollY;
      if (slideImgRef.current) {
        slideImgRef.current.style.transform = `translateY(${y * 0.35}px)`;
      }
      if (mistRef.current) {
        mistRef.current.style.transform = `translateY(${y * -0.3}px)`;
      }
      if (cloudRef1.current) cloudRef1.current.style.transform = `translateY(${y * 0.38}px)`;
      if (cloudRef2.current) cloudRef2.current.style.transform = `translateY(${y * -0.34}px)`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  const slide = HERO_SLIDES[current];

  return (
    <section
      className="relative w-full min-h-[720px] lg:h-screen flex flex-col justify-between -mt-[108px] pt-32 lg:pt-36 pb-12 overflow-hidden bg-brand-pine text-white"
      aria-label="Explore North East India hero"
    >
      {/* Background slide */}
      <div
        ref={maskRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ transition: reduced ? "none" : undefined }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={slideImgRef}
          src={slide.image}
          alt={slide.alt}
          className={`w-full h-full object-cover ${reduced ? "" : "scale-[1.04] transition-transform duration-1000 ease-out"}`}
        />

        {/* Traveling blurred mist band — active during wipe */}
        {!reduced && (
          <div
            ref={mistRef}
            className="hero-mist-band"
            aria-hidden="true"
          />
        )}

        {/* Top/middle gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-brand-pine/50 to-brand-pine/35 pointer-events-none" />
      </div>

      {/* Volumetric drifting mountain clouds (mix-blend-mode: screen, top-masked) */}
      {!reduced && (
        <div
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none z-[1] overflow-hidden"
          style={{
            mixBlendMode: "screen",
            maskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
          }}
          aria-hidden="true"
        >
          <div
            ref={cloudRef1}
            className="absolute -top-10 left-0 right-0 h-72 opacity-30 animate-cloud-drift pointer-events-none"
            style={{ background: "radial-gradient(ellipse 110% 65% at 25% 10%, rgba(255,255,255,0.85), transparent 70%)" }}
          />
          <div
            ref={cloudRef2}
            className="absolute top-20 left-0 right-0 h-64 opacity-25 animate-cloud-drift-alt pointer-events-none"
            style={{ background: "radial-gradient(ellipse 100% 70% at 75% 20%, rgba(255,255,255,0.7), transparent 70%)" }}
          />
        </div>
      )}

      {/* Seamless bottom canvas fade (linear-gradient(to top, var(--bg-canvas) 0%, transparent 100%)) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--bg-canvas) 0%, transparent 100%)" }}
        aria-hidden="true"
      />

      {/* Editorial stage with Right-Rail Concentric Ring Navigator */}
      <div className="relative z-10 max-w-[1280px] w-full mx-auto px-6 sm:px-8 my-auto py-8 lg:py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Title block */}
        <div className="max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-terracotta text-white font-label-caps text-label-caps uppercase tracking-wider backdrop-blur-sm shadow-md">
              <span className="material-symbols-outlined text-[15px]">explore</span>
              Official Civic & Eco-Tourism Gateway
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white/90 text-xs font-data-tabular shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
              <span>DoNER Gov Node · ILP Verified</span>
            </div>
          </div>
          <h1
            className="font-display-hero text-5xl sm:text-6xl lg:text-[76px] font-bold leading-none tracking-tight drop-shadow-lg"
            aria-label="Explore North East India"
          >
            <span aria-hidden="true">EXPLORE</span><br />
            <span
              aria-hidden="true"
              className="font-editorial italic text-primary-fixed font-normal"
              style={{ fontOpticalSizing: "none", fontVariationSettings: '"opsz" 11' }}
            >
              NORTH EAST
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-white/95 max-w-xl font-light leading-relaxed drop-shadow">
            Journey across living root bridges, untamed Himalayan passes, and biodiversity hotspots. Transparent shared Sumo fares, automated ILP protocols, verified council homestays.
          </p>
        </div>

        {/* Right-Rail Concentric Ring Navigator (x = 85.5% feel, smooth 850ms swell/shrink inside two thin 1.5px white rings) */}
        <div className="hidden sm:flex flex-col items-end gap-5 shrink-0" aria-label="Hero slide switcher">
          {HERO_SLIDES.map((s, i) => {
            const isActive = i === current;
            return (
              <div key={s.id} className="flex items-center gap-3 group">
                {/* Frosted caption badge with clip-path reveal */}
                <div
                  className="transition-all duration-[850ms] overflow-hidden"
                  style={{
                    clipPath: isActive ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                    opacity: isActive ? 1 : 0,
                  }}
                >
                  <div className="bg-black/55 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-1.5 text-right shadow-lg">
                    <p className="font-editorial text-sm font-semibold text-white tracking-wide">{s.region}</p>
                    <p className="font-data-tabular text-[11px] text-primary-fixed">
                      {s.elevation} · {s.permit}
                    </p>
                  </div>
                </div>

                {/* Horizontal connector bar */}
                <div
                  className="h-[1.5px] transition-all duration-[850ms]"
                  style={{
                    width: isActive ? "24px" : "0px",
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.75)" : "transparent",
                  }}
                  aria-hidden="true"
                />

                {/* Concentric Ring Thumbnail */}
                <button
                  onClick={() => runWipe(i)}
                  className="relative p-1 rounded-full transition-all duration-[850ms] focus:outline-none"
                  aria-label={`Slide ${i + 1}: ${s.region}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {/* Outer concentric ring */}
                  <div
                    className={cn(
                      "rounded-full transition-all duration-[850ms] flex items-center justify-center p-1",
                      isActive
                        ? "border-[1.5px] border-white/90 shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-100"
                        : "border-[1.5px] border-white/20 hover:border-white/60 scale-90"
                    )}
                  >
                    {/* Inner concentric ring */}
                    <div
                      className={cn(
                        "rounded-full transition-all duration-[850ms] overflow-hidden p-0.5",
                        isActive
                          ? "border-[1.5px] border-accent-terracotta w-14 h-14"
                          : "border-[1.5px] border-white/30 w-11 h-11"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.image}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  {/* Slide number pill */}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.2 rounded-full font-data-tabular shadow transition-colors",
                      isActive
                        ? "bg-accent-terracotta text-white"
                        : "bg-black/60 text-white/80"
                    )}
                  >
                    {s.slideNum}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating search bar */}
      <div className="relative z-20 max-w-[1280px] w-full mx-auto px-6 sm:px-8">
        <div className="bg-[var(--bg-surface)] text-[var(--text-ink)] rounded-2xl shadow-2xl p-4 lg:p-6 border border-[var(--border-hairline)]">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          >
            {/* Destination with Autocomplete */}
            <div className="space-y-1 relative" ref={searchInputWrapperRef}>
              <label className="font-label-caps text-label-caps uppercase text-[var(--text-muted)] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-accent-terracotta">explore</span>
                Destination or Circuit
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g. Kaziranga, Tawang, Dawki"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] text-[var(--text-ink)] border border-[var(--border-hairline)] font-body-md text-body-md placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-brand-pine"
              />

              {/* Instant Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full min-w-[280px] z-50 bg-[var(--bg-surface)] rounded-xl shadow-2xl border border-[var(--border-hairline)] overflow-hidden p-1.5 animate-[scale-in_0.15s_ease-out]">
                  <div className="px-3 py-1 font-label-caps text-[10px] uppercase text-[var(--text-muted)] tracking-wider border-b border-[var(--border-hairline)] mb-1">
                    Verified Circuits & Destinations
                  </div>
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setDestination(s.title);
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[var(--bg-editorial)] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-accent-terracotta shrink-0">
                          {s.type === "State" ? "map" : s.type === "Circuit" ? "alt_route" : "location_on"}
                        </span>
                        <div className="truncate">
                          <p className="font-body-sm text-sm font-semibold text-[var(--text-ink)] group-hover:text-accent-terracotta truncate">
                            {s.title}
                          </p>
                          <p className="font-data-tabular text-[11px] text-[var(--text-muted)] truncate">
                            {s.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="font-badge-gov text-[10px] uppercase px-1.5 py-0.5 rounded bg-[var(--bg-canvas)] text-[var(--text-muted)] border border-[var(--border-hairline)] shrink-0 ml-2">
                        {s.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps uppercase text-[var(--text-muted)] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-surface-tint">calendar_month</span>
                Travel Window
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] text-[var(--text-ink)] border border-[var(--border-hairline)] font-data-tabular text-data-tabular focus:outline-none focus:ring-2 focus:ring-brand-pine"
              />
            </div>

            {/* Traveler stepper */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps uppercase text-[var(--text-muted)] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-surface-tint">group</span>
                Travelers & Permit Units
              </label>
              <div className="flex items-center justify-between px-4 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setTravelers(t => Math.max(1, t - 1))}
                  className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] text-[var(--text-ink)] hover:bg-[var(--bg-editorial)] flex items-center justify-center font-bold text-base shadow-sm border border-[var(--border-hairline)]"
                  aria-label="Decrease travelers"
                >
                  −
                </button>
                <span className="font-data-tabular text-data-tabular font-bold text-[var(--text-ink)]">
                  {travelers} {travelers === 1 ? "Adult" : "Adults"}
                </span>
                <button
                  type="button"
                  onClick={() => setTravelers(t => Math.min(20, t + 1))}
                  className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] text-[var(--text-ink)] hover:bg-[var(--bg-editorial)] flex items-center justify-center font-bold text-base shadow-sm border border-[var(--border-hairline)]"
                  aria-label="Increase travelers"
                >
                  +
                </button>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps uppercase text-[var(--text-muted)] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-accent-terracotta">currency_rupee</span>
                Target Daily Spend (INR)
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] text-[var(--text-ink)] border border-[var(--border-hairline)] font-data-tabular text-data-tabular focus:outline-none focus:ring-2 focus:ring-brand-pine cursor-pointer appearance-none"
              >
                <option value="">Any Daily Budget</option>
                <option value="budget">₹1,200 – ₹2,000 / day (Budget/Sumo)</option>
                <option value="mid">₹2,000 – ₹3,500 / day (Eco Homestay)</option>
                <option value="comfort">₹3,500 – ₹6,000 / day (Private 4×4)</option>
                <option value="custom">Custom State Circuit</option>
              </select>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="w-full h-[46px] rounded-xl bg-accent-terracotta text-white hover:bg-accent-rust font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Find Verified Route
            </button>
          </form>

          {/* Trending micro-links */}
          <div className="mt-3.5 pt-3 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2 text-[var(--text-muted)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-caps text-label-caps uppercase text-accent-terracotta font-bold">Trending:</span>
              {["Guwahati–Kaziranga–Majuli", "Shillong–Dawki–Cherrapunji", "Bhalukpong–Tawang Corridor"].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleTrendingClick(c)}
                  className="px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--text-ink)] hover:text-accent-terracotta font-body-sm text-xs transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-surface-tint font-badge-gov text-badge-gov uppercase">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Real-time BRO Clearance Fed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
