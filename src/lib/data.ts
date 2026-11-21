// ── Canonical Data Re-exports (Single Source of Truth) ──
// This file re-exports data from the canonical sources in /src/data/
// transforming to the internal types expected by components.

import { DESTINATIONS } from "@/data/destinations";
import { TRANSPORT_ROUTES as CanonicalTransportRoutes } from "@/data/transportRoutes";
import { PERMIT_RULES } from "@/data/permitsData";
import { PUBLIC_METRICS } from "@/data/publicMetrics";
import { type NEState as CanonicalNEState } from "@/types/travel";

// ─── Internal Types (matching existing component expectations) ───

export type NEState =
  | "Assam"
  | "Meghalaya"
  | "Arunachal Pradesh"
  | "Nagaland"
  | "Manipur"
  | "Mizoram"
  | "Tripura"
  | "Sikkim";

export interface Place {
  id: string;
  slug: string;
  state: NEState;
  name: string;
  tagline: string;
  image: string;
  costPerDay: number;
  permit: "open" | "ilp" | "pap" | "rap";
  permitCost?: number;
  altitude: string;
  crowdLevel: "low" | "medium" | "high";
  verified: string;
  lat: number;
  lng: number;
  hub: string;
  circuit?: string[];
}

export interface TransportRoute {
  id: string;
  from: string;
  to: string;
  mode: "shared-sumo" | "force-winger" | "train" | "flight";
  fareINR: number;
  durationMin: number;
  operator: string;
  hub: string;
  frequency: string;
}

export interface PermitInfo {
  state: NEState;
  type: "ilp" | "pap" | "rap" | "open";
  fee: string;
  validity: string;
  portal: string;
  notes: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  region: string;
  state: NEState;
  elevation: string;
  permit: string;
  slideNum: string;
}

// ─── Transform Functions ───

function mapPermitType(permit: "None" | "ILP" | "PAP" | "RAP"): "open" | "ilp" | "pap" | "rap" {
  switch (permit) {
    case "None": return "open";
    case "ILP": return "ilp";
    case "PAP": return "pap";
    case "RAP": return "rap";
  }
}

function mapCrowdLevel(level: "Low" | "Moderate" | "Peak"): "low" | "medium" | "high" {
  switch (level) {
    case "Low": return "low";
    case "Moderate": return "medium";
    case "Peak": return "high";
  }
}

function mapVehicleType(vehicle: string): "shared-sumo" | "force-winger" | "train" | "flight" {
  const v = vehicle.toLowerCase();
  if (v.includes("sumo")) return "shared-sumo";
  if (v.includes("winger")) return "force-winger";
  if (v.includes("train") || v.includes("rail")) return "train";
  if (v.includes("flight") || v.includes("air")) return "flight";
  return "shared-sumo";
}

function parseDuration(duration: string): number {
  // Parse "3 hrs" or "3.5 hrs" or "10 hrs" to minutes
  const match = duration.match(/([\d.]+)\s*hrs?/i);
  if (match) return Math.round(parseFloat(match[1]) * 60);
  // Parse "90 min" etc.
  const minMatch = duration.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10);
  return 0;
}

// ─── Transformed Data Exports ───

export const PLACES: Place[] = DESTINATIONS.map(d => ({
  id: d.id,
  slug: d.slug,
  state: d.state,
  name: d.name,
  tagline: d.summary,
  image: d.imageUrl,
  costPerDay: d.avgDailyBudgetINR,
  permit: mapPermitType(d.permitRequired),
  permitCost: d.permitRequired !== "None" ? (d.state === "Arunachal Pradesh" ? 150 : 100) : undefined,
  altitude: d.slug === 'cherrapunji-nohkalikai-falls' ? '1,484 m ASL' : `${d.coordinates.lat}°N, ${d.coordinates.lng}°E`,
  crowdLevel: mapCrowdLevel(d.crowdLevel),
  verified: d.verifiedDate,
  lat: d.coordinates.lat,
  lng: d.coordinates.lng,
  hub: d.nearestHub,
  circuit: undefined, // Could be derived from nearby destinations
}));

export const TRANSPORT_ROUTES: TransportRoute[] = CanonicalTransportRoutes.map(r => ({
  id: r.id,
  from: r.originHub,
  to: r.destinationHub,
  mode: mapVehicleType(r.vehicleType),
  fareINR: r.fareINR,
  durationMin: parseDuration(r.duration),
  operator: r.vehicleType,
  hub: r.originLandmark,
  frequency: r.departureWindow,
}));

const PERMITS_FROM_CANONICAL: PermitInfo[] = PERMIT_RULES.map(p => ({
  state: p.state,
  type: p.indianPermit.toLowerCase() as "ilp" | "pap" | "rap" | "open",
  fee: `₹${p.indianFeeINR} (Indian) / ₹${p.foreignFeeINR} (Foreign)`,
  validity: `${p.validityDays} days`,
  portal: p.officialPortalUrl,
  notes: p.notes,
}));

// Add open states that might be missing
const OPEN_STATES: PermitInfo[] = [
  { state: "Assam", type: "open", fee: "Free", validity: "N/A", portal: "https://assamtourism.gov.in", notes: "No permit required for most areas." },
  { state: "Meghalaya", type: "open", fee: "Free / ₹50 eco-cess at some sites", validity: "N/A", portal: "https://meghalayatourism.in", notes: "No ILP. Some restricted border areas near Dawki need local ID." },
  { state: "Tripura", type: "open", fee: "Free", validity: "N/A", portal: "https://tripuratourism.gov.in", notes: "No permit required. PAP for certain border areas." },
];

// Merge, avoiding duplicates
const permitMap = new Map<string, PermitInfo>();
PERMITS_FROM_CANONICAL.forEach(p => permitMap.set(p.state, p));
OPEN_STATES.forEach(p => { if (!permitMap.has(p.state)) permitMap.set(p.state, p); });
export const PERMITS: PermitInfo[] = Array.from(permitMap.values());

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "s1",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXkQhzUWnPM_GY8UY0sxNq_1XsnTIwj14iKTjctACgOGPiqfEtpnGDn5KQkqkfWor9egp-Jlv6WOcaAJSw267LsO12073rCRB9tt0lh20umvtWFKSyimhIChmRY6Jd3LWCxLSXPPdsy7psMNwQRIRPXHLRowNvxMqUuZYMvpOoQ6retBZ1Op4YPcdrX9ll7cwThPlRmmk-pw1_ih9zpz7ykzzgIZDG5-4Ok-fdxEY",
    alt: "Cinematic aerial view of lush rolling hills, tea gardens, and mountain roads over Cherrapunji with morning mist",
    region: "Meghalaya & Mizoram Ridge",
    state: "Meghalaya",
    elevation: "1,484m MSL",
    permit: "ILP Exempt",
    slideNum: "01",
  },
  {
    id: "s2",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDw5J9KZ_3YX7ZtScbEmZ-yKulUFmglcYAI9n1uUcLATNO45ai0OrItC_dWMG_fkyLpL1kvU3xqPxj6UdlAda23eziiZOlmxmE56epAKK5aa5rbfdzT85Sy6ESnth-WRhLqEGM0G5BFTVzBRhwOqXWs7ssiJzI2Q0x-c2O4oYun4cDfnLP62k9dhEsbqXy_auwI0mn8RTgpfW_Q5PWKs0eqG0qSeV84Mgyj5ob6OZ4",
    alt: "Multi-tiered waterfall plunging down terracotta canyon into jade lagoon in North East India",
    region: "Nohkalikai Falls, Cherrapunji",
    state: "Meghalaya",
    elevation: "1,430m MSL",
    permit: "Open — No ILP",
    slideNum: "02",
  },
  {
    id: "s3",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOXjILzA_OwBAzDuuAkaus3WNGCRI2fBBaW4IFg97bR13F784btsewcYopxt3JSNeMECZP-Px6F5ao1fVgsr0aO7nwmcifT4LqHtY2l0HX_hcXtdkDlF8rWRuNpMmWQm_JC8uQYfT1cxgJizcAtoR8DJG78TiSSyA0_fSHkXYG8tW4DClPWuPrtfqQD56I2CGEilYusA-pJ9wxmwXB8_K8CxpMYQc6znPEPdWN6LU",
    alt: "Living root bridge spanning clear mountain river in Nongriat Cherrapunji surrounded by terraced slopes",
    region: "Nongriat Valley, Cherrapunji",
    state: "Meghalaya",
    elevation: "680m MSL",
    permit: "Open — Eco-Cess ₹50",
    slideNum: "03",
  },
];

export const NE_STATES: NEState[] = [
  "Assam", "Meghalaya", "Arunachal Pradesh", "Nagaland",
  "Manipur", "Mizoram", "Tripura", "Sikkim",
];

export const BUDGET_DATA = PUBLIC_METRICS.stateBudgetComparison.map(s => ({
  state: s.state,
  budget: s.backpackerINR,
  mid: s.midRangeINR,
  comfort: Math.round(s.midRangeINR * 1.6),
}));

export const SEASONALITY = {
  states: ["AS", "ML", "AP", "NL", "MN", "MZ", "TR", "SK"],
  months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  data: PUBLIC_METRICS.seasonalityMatrix.map(s => {
    const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthOrder.map(m => {
      const val = s.months[m as keyof typeof s.months];
      switch (val) {
        case "Low": return 2;
        case "Moderate": return 5;
        case "Peak": return 8;
        case "Monsoon": return 3;
        default: return 5;
      }
    });
  }),
};