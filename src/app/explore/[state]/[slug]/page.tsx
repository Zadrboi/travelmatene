import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import QuickFactsSpotlight from "@/components/explore/QuickFactsSpotlight";
import PlaceCard from "@/components/explore/PlaceCard";
import { PLACES } from "@/lib/data";
import { formatINR, permitLabel } from "@/lib/utils";

interface Props { params: { state: string; slug: string } }

export async function generateStaticParams() {
  return PLACES.map(p => ({
    state: p.state.toLowerCase().replace(/ /g, "-"),
    slug:  p.slug,
  }));
}

export default function PlaceDetailPage({ params }: Props) {
  const place = PLACES.find(p => p.slug === params.slug);
  if (!place) notFound();

  const nearby = PLACES.filter(p => p.state === place.state && p.id !== place.id).slice(0, 3);

  return (
    <div className="pt-[112px] min-h-screen bg-bg-canvas pb-20 md:pb-8">
      {/* Hero */}
      <div className="relative w-full h-[55vh] min-h-[380px] overflow-hidden" data-flip-target={place.slug}>
        <Image src={place.image} alt={`${place.name} — ${place.tagline.slice(0, 60)}`} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-pine/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1280px] mx-auto px-8 pb-8 text-white">
          <Breadcrumbs crumbs={[
            { label: "Home", href: "/" },
            { label: "Explore", href: "/explore" },
            { label: place.state, href: `/explore?state=${encodeURIComponent(place.state)}` },
            { label: place.name },
          ]} />
          <h1 className="font-editorial text-4xl lg:text-5xl mt-3" style={{ fontOpticalSizing: "none" }}>{place.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="font-data-tabular text-data-tabular text-primary-fixed">{place.altitude}</span>
            <span className="text-white/40">·</span>
            <span className="font-data-tabular text-data-tabular text-secondary-fixed">{formatINR(place.costPerDay)}/day</span>
            <span className="text-white/40">·</span>
            <span className="font-badge-gov text-badge-gov uppercase text-primary-fixed">{permitLabel(place.permit, place.permitCost)}</span>
          </div>
        </div>
      </div>

      {/* Cost breakdown + Sumo hub */}
      <div className="max-w-[1280px] mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-surface)] rounded-2xl p-6 shadow-card border border-[var(--border-hairline)] space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-[var(--text-ink)]">Transparent ₹/day Breakdown</h2>
          {[
            ["Accommodation (Council Homestay)", "₹600–₹900"],
            ["Shared Sumo / Local Transport",   "₹200–₹400"],
            ["Meals (Local dhabas)",             "₹150–₹250"],
            ["Entry fees / Guides",              "₹100–₹200"],
            ["Buffer (misc)",                    "₹100"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-border-hairline pb-2">
              <span className="font-body-sm text-body-sm text-text-muted">{k}</span>
              <span className="font-data-tabular text-data-tabular text-text-ink font-semibold">{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="font-label-caps text-label-caps uppercase text-text-muted">Total Est. /day</span>
            <span className="font-headline-sm text-headline-sm text-accent-terracotta">{formatINR(place.costPerDay)}</span>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-2xl p-6 shadow-card border border-[var(--border-hairline)] space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-[var(--text-ink)]">Shared Transport Hub</h2>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-editorial)]">
            <span className="material-symbols-outlined text-[22px] text-accent-terracotta">directions_bus</span>
            <div>
              <p className="font-data-tabular text-data-tabular text-text-ink font-semibold">{place.hub}</p>
              <p className="font-body-sm text-body-sm text-text-muted">Shared Sumo hub serving this route</p>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-text-muted">
            Board from early morning (06:00–08:00). Seats fill quickly — no advance booking on most routes. Carry permit printout for checkpoint verification.
          </p>
          {place.circuit && (
            <div>
              <p className="font-label-caps text-label-caps uppercase text-text-muted mb-2">Nearby Circuit</p>
              <div className="flex gap-2 flex-wrap">
                {place.circuit.map(c => (
                  <span key={c} className="px-3 py-1 rounded-full bg-[var(--bg-editorial)] font-body-sm text-body-sm text-text-ink">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Facts Spotlight */}
      <QuickFactsSpotlight
        title={place.name}
        subtitle={`${place.state} · ${place.altitude}`}
        audioSummary={`${place.name}. ${place.tagline} Located in ${place.state} at ${place.altitude}.`}
        facts={[
          { label: "State",    value: place.state },
          { label: "Altitude", value: place.altitude },
          { label: "Crowd",    value: place.crowdLevel.charAt(0).toUpperCase() + place.crowdLevel.slice(1) },
          { label: "Permit",   value: permitLabel(place.permit, place.permitCost) },
          { label: "Sumo Hub", value: place.hub },
          { label: "Verified", value: `Verified ${place.verified}` },
        ]}
        portrait={place.image}
        portraitAlt={`${place.name} documentary portrait`}
      />

      {/* Nearby */}
      {nearby.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          <h2 className="font-headline-md text-headline-md text-[var(--text-ink)] mb-4">More in {place.state}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {nearby.map(p => <PlaceCard key={p.id} place={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
