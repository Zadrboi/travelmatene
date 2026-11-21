/**
 * TravelMateNE — Canonical Shared Contract
 * Used by both Frontend and Backend
 * Generated: Nov 2026
 */

export type NEState =
  | 'Assam'
  | 'Meghalaya'
  | 'Arunachal Pradesh'
  | 'Sikkim'
  | 'Nagaland'
  | 'Manipur'
  | 'Mizoram'
  | 'Tripura';

export type PlaceCategory =
  | 'Nature'
  | 'Culture & Heritage'
  | 'Wildlife'
  | 'Adventure'
  | 'Spiritual';

export type PermitType = 'None' | 'ILP' | 'PAP' | 'RAP';

export interface Place {
  id: string;
  slug: string;
  name: string;
  state: NEState;
  category: PlaceCategory;
  summary: string;
  audioBrief: string;
  highlights: string[];
  bestMonths: string[];
  avgDailyBudgetINR: number;
  costBreakdown: {
    stayINR: number;
    transportINR: number;
    foodINR: number;
    entryINR: number;
  };
  permitRequired: PermitType;
  nearestHub: string;
  crowdLevel: 'Low' | 'Moderate' | 'Peak';
  signalStrength: 'Good' | 'Patchy' | 'Offline';
  coordinates: {
    lat: number;
    lng: number;
  };
  verifiedDate: string;
  officialSourceUrl: string;
  imageUrl: string;
  galleryUrls: string[];
}

export interface TransportRoute {
  id: string;
  originHub: string;
  originLandmark: string;
  destinationHub: string;
  state: NEState;
  vehicleType: 'Shared Tata Sumo' | 'Force Winger' | 'State Bus (ASTC/SNT/MTC)' | 'Shared Cab';
  fareINR: number;
  duration: string;
  departureWindow: string;
  bookingMode: 'Counter / Stand' | 'Online & Stand';
  verifiedDate: string;
}

export interface PermitRule {
  state: NEState;
  indianPermit: PermitType;
  foreignPermit: PermitType;
  indianFeeINR: number;
  foreignFeeINR: number;
  validityDays: number;
  processingTime: string;
  officialPortalUrl: string;
  checkposts: string[];
  notes: string;
  lastVerified: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'ID & Permit' | 'Transport & Stay' | 'Offline & Gear';
  required: boolean;
  checked: boolean;
}

export interface EligibilityInput {
  nationality: 'Indian' | 'Foreign' | 'OCI';
  homeState: string;
  destinationStates: NEState[];
  durationDays: number;
}

export interface EligibilityResult {
  highestPermitRequired: PermitType;
  stateBreakdowns: {
    state: NEState;
    permitType: PermitType;
    estimatedFeeINR: number;
    officialPortalUrl: string;
    notes: string;
    lastVerified: string;
  }[];
  totalEstimatedFeeINR: number;
  generatedChecklist: ChecklistItem[];
}

export interface SavedItinerary {
  id: string;
  title: string;
  states: NEState[];
  days: number;
  totalBudgetINR: number;
  permitsSummary: string;
  dayByDay: {
    day: number;
    title: string;
    costINR: number;
    transportTip: string;
  }[];
  savedAt: string;
}

export interface PublicMetricsData {
  kpiSummary: {
    totalDestinations: number;
    avgBackpackerDailyINR: number;
    permitFreeStates: number;
    verifiedTransportRoutes: number;
  };
  stateBudgetComparison: {
    state: NEState;
    backpackerINR: number;
    midRangeINR: number;
  }[];
  seasonalityMatrix: {
    state: NEState;
    months: Record<string, 'Low' | 'Moderate' | 'Peak' | 'Monsoon'>;
  }[];
  connectivityIndex: {
    circuit: string;
    state: NEState;
    signalScore: number;
    offlineRecommended: boolean;
    carriers: string;
  }[];
}