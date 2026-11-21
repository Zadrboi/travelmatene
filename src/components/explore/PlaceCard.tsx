"use client";
import { useRef } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { useFlip } from "@/context/FlipTransitionContext";
import { useMotion } from "@/context/MotionPreferenceContext";
import { type Place } from "@/lib/data";
import { cn, formatINR, permitLabel } from "@/lib/utils";

const PERMIT_CLASS: Record<string, string> = {
  open: "badge-open",
  ilp:  "badge-ilp",
  pap:  "badge-pap",
  rap:  "badge-rap",
};
const CROWD_CLASS: Record<string, string> = {
  low:    "crowd-low",
  medium: "crowd-medium",
  high:   "crowd-high",
};

export default function PlaceCard({ place, priority = false }: { place: Place; priority?: boolean }) {
  const { triggerFlip } = useFlip();
  const { isLiteMode } = useMotion();
  const imgRef = useRef<HTMLDivElement>(null);

  const href = `/explore/${encodeURIComponent(place.state.toLowerCase().replace(/ /g, "-"))}/${place.slug}`;

  function handleClick() {
    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      triggerFlip(rect, place.image, href);
    }
  }

  return (
    <article
      className="bg-[var(--bg-surface)] rounded-xl overflow-hidden shadow-card hover:shadow-card-hover border border-[var(--border-hairline)] transition-all group flex flex-col flip-target cursor-pointer"
      onClick={handleClick}
      role="link"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && handleClick()}
      aria-label={`${place.name}, ${place.state} — ${formatINR(place.costPerDay)}/day`}
    >
      {/* Image */}
      <div ref={imgRef} className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-editorial)]">
        {isLiteMode ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-editorial)]">
            <span className="material-symbols-outlined text-[40px] text-text-muted">landscape</span>
          </div>
        ) : (
          <SafeImage
            src={place.image}
            alt={`${place.name} — ${place.tagline.slice(0, 60)}`}
            fallbackTitle={place.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
          />
        )}
        {/* State badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-badge-gov text-badge-gov uppercase shadow-sm">
          {place.state}
        </div>
        {/* Permit badge */}
        <div className={cn(
          "absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded font-badge-gov text-badge-gov uppercase tracking-wider backdrop-blur-md shadow-sm",
          PERMIT_CLASS[place.permit] ?? "badge-open"
        )}>
          {permitLabel(place.permit, place.permitCost)}
        </div>
        {/* Favourite */}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur text-text-muted hover:text-accent-terracotta flex items-center justify-center shadow transition-colors"
          title="Save to itinerary"
          aria-label="Save to itinerary"
        >
          <span className="material-symbols-outlined text-[18px]">favorite</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-[var(--text-ink)] group-hover:text-accent-terracotta transition-colors line-clamp-1">
            {place.name}
          </h3>
          <span className="font-data-tabular text-data-tabular text-accent-terracotta font-bold shrink-0 ml-2">
            {formatINR(place.costPerDay)}<span className="text-[11px] font-normal text-text-muted">/day</span>
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-text-muted line-clamp-2">{place.tagline}</p>
      </div>

      {/* Footer meta */}
      <div className="px-4 pb-3.5 pt-2 bg-[var(--bg-canvas)]/50 border-t border-[var(--border-hairline)] flex items-center justify-between text-text-muted text-[12px] font-data-tabular">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-surface-tint">altitude</span>
          {place.altitude}
        </span>
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", CROWD_CLASS[place.crowdLevel])}>
          {place.crowdLevel} crowd
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-status-verified">verified</span>
          Verified {place.verified}
        </span>
      </div>
    </article>
  );
}
