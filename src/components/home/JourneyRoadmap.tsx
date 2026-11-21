"use client";
import { useEffect, useRef } from "react";
import { useMotion } from "@/context/MotionPreferenceContext";

const STAGES = [
  { icon: "search",         num: "01", label: "Research",   detail: "Browse 8-state directory, check ILP requirements, compare ₹/day costs" },
  { icon: "policy",         num: "02", label: "Permit",     detail: "Apply online via official .gov.in portals — ILP processed in 24–48 hrs" },
  { icon: "directions_bus", num: "03", label: "Book Sumo",  detail: "Secure shared Tata Sumo / Force Winger seat from your hub at market fare" },
  { icon: "home_work",      num: "04", label: "Homestay",   detail: "Book council-verified homestays — rates include local breakfast & guide" },
  { icon: "landscape",      num: "05", label: "Explore",    detail: "Arrive safely. Offline Pocket Mode keeps all permits, routes, and maps cached." },
];

export default function JourneyRoadmap() {
  const { prefersReducedMotion, isLiteMode } = useMotion();
  const reduced = prefersReducedMotion || isLiteMode;
  const svgRef = useRef<SVGPathElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced || !svgRef.current) return;
    const path = svgRef.current;
    const totalLength = path.getTotalLength();
    path.style.strokeDasharray = `${totalLength}`;
    path.style.strokeDashoffset = `${totalLength}`;

    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start: number | null = null;
      function frame(ts: number) {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / 1250, 1);
        path.style.strokeDashoffset = `${totalLength * (1 - progress)}`;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      obs.disconnect();
    }, { threshold: 0.2 });

    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="w-full max-w-[1280px] mx-auto px-6 sm:px-8 py-16" aria-labelledby="roadmap-heading">
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center justify-center gap-2 text-accent-terracotta font-label-caps text-label-caps uppercase tracking-widest">
          <span className="w-2.5 h-[2px] bg-accent-terracotta" />
          Field Workflow Protocol
          <span className="w-2.5 h-[2px] bg-accent-terracotta" />
        </div>
        <h2 id="roadmap-heading" className="font-editorial text-3xl sm:text-4xl text-[var(--text-ink)]" style={{ fontOpticalSizing: "none" }}>
          Your Journey, Step by Step
        </h2>
        <p className="font-body-md text-body-md text-[var(--text-muted)] max-w-xl mx-auto">
          Transparent, council-vetted logistics from pre-departure permit filings to mountain road transit.
        </p>
      </div>

      {/* SVG S-curve ribbon with milestone badges (hidden on mobile, responsive on lg) */}
      <div className="relative w-full h-24 mb-4 hidden lg:block" aria-hidden="true">
        <svg viewBox="0 0 1000 70" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Subtle background track */}
          <path
            d="M 100,35 C 200,10 200,60 300,35 S 400,10 500,35 S 600,60 700,35 S 800,10 900,35"
            fill="none"
            stroke="var(--border-hairline)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Animated terracotta ribbon */}
          <path
            ref={svgRef}
            d="M 100,35 C 200,10 200,60 300,35 S 400,10 500,35 S 600,60 700,35 S 800,10 900,35"
            fill="none"
            stroke="#E0531F"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* 5 Milestone badges aligned with the 5 columns (100, 300, 500, 700, 900) */}
          {[100, 300, 500, 700, 900].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={35} r="16" fill="var(--bg-surface)" stroke="#E0531F" strokeWidth="2.5" />
              <circle cx={x} cy={35} r="8" fill="#12372A" />
              <circle cx={x} cy={35} r="3" fill="#ffffff" />
            </g>
          ))}
        </svg>
      </div>

      {/* 5 Stage cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center space-y-3 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm hover:shadow-card hover:border-accent-terracotta/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center group-hover:scale-110 group-hover:bg-accent-terracotta group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
            </div>
            <div>
              <span className="font-data-tabular text-[10px] font-bold text-accent-terracotta uppercase tracking-wider block">
                Stage {s.num}
              </span>
              <h3 className="font-headline-sm text-headline-sm text-[var(--text-ink)] mt-0.5">
                {s.label}
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-[var(--text-muted)] leading-relaxed">
              {s.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
