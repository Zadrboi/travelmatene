import Link from "next/link";
import MistyHero from "@/components/hero/MistyHero";
import PlaceCard from "@/components/explore/PlaceCard";
import QuickFactsSpotlight from "@/components/explore/QuickFactsSpotlight";
import JourneyRoadmap from "@/components/home/JourneyRoadmap";
import TrustBannerAndFaq from "@/components/home/TrustBannerAndFaq";
import { PLACES } from "@/lib/data";

const STANDOUT_SLUGS = [
  "kaziranga-national-park",            // Assam
  "cherrapunji-nohkalikai-falls",      // Meghalaya
  "tawang-monastery",                  // Arunachal Pradesh
  "tsomgo-changu-lake",                // Sikkim
  "dzukou-valley",                     // Nagaland
  "loktak-lake-keibul-lamjao",         // Manipur
  "vantawng-falls-thenzawl",           // Mizoram
  "ujjayanta-palace-agartala",         // Tripura
];

export default function HomePage() {
  const curatedPlaces = STANDOUT_SLUGS
    .map(slug => PLACES.find(p => p.slug === slug))
    .filter(Boolean) as typeof PLACES;

  // Nohkalikai or first place for the editorial quick facts spotlight
  const featured = PLACES.find(p => p.slug === "cherrapunji-nohkalikai-falls") || PLACES[0];

  return (
    <div className="flex flex-col w-full pb-16 md:pb-0">
      <MistyHero />

      {/* Recommended Places — 8 curated cards (1 standout per NE state) */}
      <section className="w-full max-w-[1280px] mx-auto px-6 sm:px-8 py-16 space-y-8" aria-labelledby="places-heading">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-accent-terracotta font-label-caps text-label-caps uppercase tracking-widest">
              <span className="w-2.5 h-[2px] bg-accent-terracotta" />
              Curated Field Directory
            </div>
            <h2 id="places-heading" className="font-editorial text-3xl sm:text-4xl text-[var(--text-ink)]" style={{ fontOpticalSizing: "none" }}>
              Recommended Places & Verified Circuits
            </h2>
            <p className="font-body-md text-body-md text-text-muted max-w-2xl">
              8 standout destinations representing each Sister State. Audited by local village councils and transit boards for safety and road readiness.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["8 Sister States", "Permit-Free", "Under ₹1,500/day", "Low Crowd Index"].map((f, i) => (
              <button
                key={f}
                className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider whitespace-nowrap transition-colors ${
                  i === 0
                    ? "bg-brand-pine text-white"
                    : "bg-[var(--bg-surface)] text-[var(--text-ink)] border border-[var(--border-hairline)] hover:bg-[var(--bg-editorial)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 4x2 Curated Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curatedPlaces.map((p, i) => (
            <PlaceCard key={p.id} place={p} priority={i < 4} />
          ))}
        </div>

        {/* Prominent CTA to explore all 32 destinations */}
        <div className="flex justify-center pt-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-accent-terracotta text-white font-label-caps text-label-caps uppercase tracking-wider hover:bg-accent-rust transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <span>Explore All 32 Destinations</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Quick Facts Spotlight */}
      <QuickFactsSpotlight
        title={featured.name}
        subtitle="Cherrapunji, East Khasi Hills — Meghalaya"
        audioSummary={`${featured.name}. ${featured.tagline} Located at 1,484 m ASL, this destination is ${featured.permit === 'open' ? 'permit-free and open to all travellers' : 'accessible with an Inner Line Permit'}. Expected daily cost: around ${featured.costPerDay} rupees. Crowd level is currently ${featured.crowdLevel}.`}
        facts={[
          { label: "State",       value: featured.state },
          { label: "Altitude",    value: "1,484 m ASL" },
          { label: "Coordinates", value: `${featured.lat}°N, ${featured.lng}°E` },
          { label: "Cost/Day",    value: `₹${featured.costPerDay.toLocaleString("en-IN")}` },
          { label: "Permit",      value: featured.permit === "open" ? "Open — No ILP" : `ILP Required (₹${featured.permitCost})` },
          { label: "Crowd",       value: featured.crowdLevel.charAt(0).toUpperCase() + featured.crowdLevel.slice(1) },
          { label: "Sumo Hub",    value: featured.hub },
          { label: "Verified",    value: `Nov ${new Date().getFullYear()}` },
        ]}
        portrait={featured.image}
        portraitAlt={`${featured.name} documentary portrait`}
      />

      <JourneyRoadmap />
      <TrustBannerAndFaq />
    </div>
  );
}
