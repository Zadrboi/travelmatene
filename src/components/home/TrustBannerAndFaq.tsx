"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Do Indian citizens need a permit to visit Arunachal Pradesh?",
    a: "Yes. All non-residents — Indian citizens included — require an Inner Line Permit (ILP) to enter Arunachal Pradesh. The fee is ₹150 for Indian nationals. Apply online at arunachalilp.com at least 48 hours before your travel date.",
  },
  {
    q: "What is the cheapest way to travel between states in the North East?",
    a: "Shared Tata Sumo (7-seater) is the backbone of inter-district travel. Routes like Guwahati–Shillong cost ₹180–₹220 per seat. Force Winger services cover more remote districts. Train options are limited — the rail network only reaches Dimapur (Nagaland) and Jiribam (Manipur border).",
  },
  {
    q: "Is connectivity reliable in remote NE districts?",
    a: "BSNL and BSNL Satellite provide the widest reach, but private operators (Jio, Airtel) cover most district towns. High-altitude passes, forest tracts (Dzukou Valley, Phawngpui Peak), and border areas often have no signal. Download the app as a PWA and cache your itinerary before departure.",
  },
  {
    q: "How does the shared Sumo system work for first-time travellers?",
    a: "Sumos depart from fixed stands (not bus stations) when seats fill. No booking in most cases — arrive early morning (06:00–08:00) to guarantee a seat. For routes into ILP areas (Tawang, Kohima), permits are verified at checkpoints. Driver-guides often double as informal translators.",
  },
  {
    q: "Can foreigners / OCI cardholders visit Arunachal Pradesh?",
    a: "Foreign nationals and OCI cardholders need a Protected Area Permit (PAP) from the Ministry of Home Affairs, Delhi. Processing takes 4–6 weeks. Some inner-line areas (near China border) are additionally restricted — contact the nearest Indian Embassy for current zone maps.",
  },
];

export default function TrustBannerAndFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="w-full space-y-12 pb-16" aria-labelledby="faq-heading">
      {/* Deep Pine trust / PWA banner */}
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="rounded-2xl bg-brand-pine text-white p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-card">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-primary-fixed tracking-widest">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Built for the Field
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-white font-medium" style={{ fontOpticalSizing: "none" }}>
              Works in zero-signal zones, offline and cached.
            </h2>
            <p className="font-body-md text-body-md text-white/85 leading-relaxed">
              Install as a PWA — permits, fares, and your itinerary are stored locally in IndexedDB. No network needed after the first load. All official data sourced directly from DoNER, state ILP portals, and BRO advisories.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm font-badge-gov text-badge-gov uppercase text-primary-fixed border border-white/10">
              <span className="material-symbols-outlined text-[16px]">offline_pin</span>
              PWA Offline Cached
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm font-badge-gov text-badge-gov uppercase text-primary-fixed border border-white/10">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              DoNER Data Node
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordions */}
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-4" id="faq">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center gap-2 text-accent-terracotta font-label-caps text-label-caps uppercase tracking-widest">
            <span className="w-2.5 h-[2px] bg-accent-terracotta" />
            Field Q&A
            <span className="w-2.5 h-[2px] bg-accent-terracotta" />
          </div>
          <h2 id="faq-heading" className="font-editorial text-3xl sm:text-4xl text-[var(--text-ink)]" style={{ fontOpticalSizing: "none" }}>
            Frequently Asked Questions
          </h2>
          <p className="font-body-md text-body-md text-[var(--text-muted)]">
            Permit rules, transport stands, and mountain connectivity — answered plainly.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden shadow-sm transition-colors"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[var(--bg-editorial)]/40 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span className="font-headline-sm text-headline-sm text-[var(--text-ink)] text-[15px] font-medium">
                  {faq.q}
                </span>
                <span className={cn("material-symbols-outlined text-[20px] text-[var(--text-muted)] shrink-0 transition-transform duration-200", openIdx === i ? "rotate-45 text-accent-terracotta" : "")}>
                  add
                </span>
              </button>
              <div className={cn("accordion-body", openIdx === i ? "open" : "")}>
                <div>
                  <p className="px-6 pb-4 pt-1 font-body-md text-body-md text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-hairline)]/50">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
