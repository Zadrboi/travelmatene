import type {
  EligibilityInput,
  EligibilityResult,
  ChecklistItem,
  PermitRule,
  PermitType,
  NEState
} from '@/types/travel';
import { PERMIT_RULES } from '@/data/permitsData';

/**
 * Deterministic permit eligibility engine for multi-state NE trips.
 * Supports Indian, Foreign, and OCI nationalities.
 * Exempts Indian citizens whose homeState matches an ILP destination state.
 * Generates deduplicated dynamic checklist.
 */
export function checkPermitEligibility(input: EligibilityInput): EligibilityResult {
  const { nationality, homeState, destinationStates, durationDays } = input;

  // Normalize home state for comparison
  const normalizedHomeState = homeState.trim();

  // Process each destination state
  const stateBreakdowns = destinationStates.map(state => {
    const rule = PERMIT_RULES.find(r => r.state === state);
    if (!rule) {
      return {
        state,
        permitType: 'None' as PermitType,
        estimatedFeeINR: 0,
        officialPortalUrl: '',
        notes: 'No permit data available',
        lastVerified: 'Nov 2026'
      };
    }

    let permitType: PermitType;
    let estimatedFeeINR: number;
    let notes = rule.notes;

    if (nationality === 'Indian') {
      // Check home-state exemption for ILP states
      if (rule.indianPermit === 'ILP' && normalizedHomeState === state) {
        permitType = 'None';
        estimatedFeeINR = 0;
        notes = `Exempt: You are a resident of ${state}. ${rule.notes}`;
      } else {
        permitType = rule.indianPermit;
        estimatedFeeINR = rule.indianFeeINR;
      }
    } else if (nationality === 'Foreign') {
      permitType = rule.foreignPermit;
      estimatedFeeINR = rule.foreignFeeINR;
    } else { // OCI
      // OCI cardholders treated as foreigners for permit purposes
      permitType = rule.foreignPermit;
      estimatedFeeINR = rule.foreignFeeINR;
      notes = `OCI cardholder: ${rule.notes}`;
    }

    return {
      state,
      permitType,
      estimatedFeeINR,
      officialPortalUrl: rule.officialPortalUrl,
      notes,
      lastVerified: rule.lastVerified
    };
  });

  // Determine highest permit required across all states
  const permitHierarchy: PermitType[] = ['None', 'ILP', 'PAP', 'RAP'];
  let highestPermitRequired: PermitType = 'None';

  for (const breakdown of stateBreakdowns) {
    const currentIndex = permitHierarchy.indexOf(breakdown.permitType);
    const highestIndex = permitHierarchy.indexOf(highestPermitRequired);
    if (currentIndex > highestIndex) {
      highestPermitRequired = breakdown.permitType;
    }
  }

  // Calculate total estimated fee
  const totalEstimatedFeeINR = stateBreakdowns.reduce((sum, b) => sum + b.estimatedFeeINR, 0);

  // Generate dynamic checklist
  const generatedChecklist = generateChecklist(nationality, destinationStates, stateBreakdowns, durationDays);

  return {
    highestPermitRequired,
    stateBreakdowns,
    totalEstimatedFeeINR,
    generatedChecklist
  };
}

/**
 * Generates a deduplicated checklist based on nationality, destination states, and permit requirements.
 */
function generateChecklist(
  nationality: 'Indian' | 'Foreign' | 'OCI',
  destinationStates: NEState[],
  stateBreakdowns: EligibilityResult['stateBreakdowns'],
  durationDays: number
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  let idCounter = 1;

  const addItem = (label: string, category: ChecklistItem['category'], required: boolean) => {
    // Deduplicate by label
    if (!items.some(item => item.label === label)) {
      items.push({
        id: `chk-${idCounter++}`,
        label,
        category,
        required,
        checked: false
      });
    }
  };

  // --- ID & PERMIT ---
  if (nationality === 'Indian') {
    addItem('Aadhaar Card (original + photocopy)', 'ID & Permit', true);
    addItem('Voter ID / Driving License (backup ID)', 'ID & Permit', true);
  } else if (nationality === 'Foreign') {
    addItem('Passport (valid 6+ months, original + photocopy)', 'ID & Permit', true);
    addItem('Indian Visa (appropriate category)', 'ID & Permit', true);
    addItem('Passport-size photos (8–10, white background)', 'ID & Permit', true);
  } else { // OCI
    addItem('OCI Card (original + photocopy)', 'ID & Permit', true);
    addItem('Foreign Passport (valid 6+ months)', 'ID & Permit', true);
    addItem('Passport-size photos (8–10, white background)', 'ID & Permit', true);
  }

  // Permit-specific documents
  const requiresILP = stateBreakdowns.some(b => b.permitType === 'ILP');
  const requiresPAP = stateBreakdowns.some(b => b.permitType === 'PAP');
  const requiresRAP = stateBreakdowns.some(b => b.permitType === 'RAP');

  if (requiresILP) {
    addItem('e-ILP Printout (color, 2 copies per ILP state)', 'ID & Permit', true);
    addItem('ILP Application Reference Numbers', 'ID & Permit', true);
  }
  if (requiresPAP) {
    addItem('PAP Approval Letter (for Sikkim restricted zones)', 'ID & Permit', true);
    addItem('Passport photos for PAP (4 extra)', 'ID & Permit', true);
  }
  if (requiresRAP) {
    addItem('RAP Approval from MHA (carry printout)', 'ID & Permit', true);
    addItem('Itinerary with fixed entry/exit dates for RAP', 'ID & Permit', true);
    if (nationality === 'Foreign') {
      addItem('Form FC (Registration) for stays >180 days', 'ID & Permit', false);
    }
  }

  // --- TRANSPORT & STAY ---
  addItem('Pre-booked accommodation confirmations', 'Transport & Stay', true);
  addItem('Return/onward travel tickets (bus/flight/train)', 'Transport & Stay', true);
  addItem('Shared Sumo/Bus tickets (book day before for popular routes)', 'Transport & Stay', false);
  addItem('Local transport app (RedBus, MakeMyTrip) for ASTC/SNT buses', 'Transport & Stay', false);

  // State-specific transport notes
  const hasArunachal = destinationStates.includes('Arunachal Pradesh');
  const hasSikkimNorth = destinationStates.includes('Sikkim'); // Could be North Sikkim
  const hasNagaland = destinationStates.includes('Nagaland');
  const hasMizoram = destinationStates.includes('Mizoram');
  const hasManipur = destinationStates.includes('Manipur');

  if (hasArunachal) {
    addItem('Tezpur→Bhalukpong→Bomdila→Tawang Sumo schedule confirmed', 'Transport & Stay', true);
    addItem('Buffer day for Sela Pass weather/road closure', 'Transport & Stay', false);
  }
  if (hasSikkimNorth) {
    addItem('Gangtok→Lachung Sumo booked (early morning departure)', 'Transport & Stay', true);
    addItem('PAP obtained before Lachung departure', 'Transport & Stay', true);
  }
  if (hasNagaland) {
    addItem('Dimapur→Kohima Sumo timing noted (every 30 min)', 'Transport & Stay', false);
    if (durationDays >= 7) addItem('Hornbill Festival dates checked (Dec 1–10)', 'Transport & Stay', false);
  }
  if (hasMizoram) {
    addItem('Aizawl→Thenzawl/Sangau Sumo schedule confirmed', 'Transport & Stay', true);
  }
  if (hasManipur) {
    addItem('Imphal→Ukhrul/Moreh Sumo timing confirmed', 'Transport & Stay', true);
  }

  // --- OFFLINE & GEAR ---
  // Check for any mountain/patchy-signal/offline states
  const mountainStates: NEState[] = ['Arunachal Pradesh', 'Sikkim', 'Nagaland', 'Manipur', 'Mizoram', 'Meghalaya'];
  const hasMountainState = destinationStates.some(s => mountainStates.includes(s));
  const hasOfflineArea = destinationStates.includes('Arunachal Pradesh') || 
                         destinationStates.includes('Sikkim') ||
                         destinationStates.includes('Nagaland') ||
                         destinationStates.includes('Meghalaya');

  if (hasMountainState) {
    addItem('Offline maps downloaded (Maps.me / Organic Maps / Google Maps offline)', 'Offline & Gear', true);
    addItem('Power bank (20,000 mAh minimum)', 'Offline & Gear', true);
    addItem('Warm layers (fleece, down jacket, thermals)', 'Offline & Gear', true);
    addItem('Rain gear (poncho + waterproof backpack cover)', 'Offline & Gear', true);
  }
  if (hasOfflineArea) {
    addItem('BSNL/Jio SIM (best coverage in remote areas)', 'Offline & Gear', true);
    addItem('Physical map / printed route notes', 'Offline & Gear', false);
    addItem('Satellite messenger (Garmin inReach) for solo treks', 'Offline & Gear', false);
  }
  if (durationDays > 10) {
    addItem('Prescription medications + basic first aid', 'Offline & Gear', true);
    addItem('Water purification tablets / filter bottle', 'Offline & Gear', false);
  }
  if (nationality === 'Foreign' || nationality === 'OCI') {
    addItem('Emergency contact: Embassy/Consulate details saved offline', 'Offline & Gear', true);
  }

  return items;
}

/**
 * Quick check: does a trip require any permits?
 */
export function requiresAnyPermit(input: EligibilityInput): boolean {
  const result = checkPermitEligibility(input);
  return result.highestPermitRequired !== 'None';
}

/**
 * Get total permit cost for a trip
 */
export function getTotalPermitCost(input: EligibilityInput): number {
  const result = checkPermitEligibility(input);
  return result.totalEstimatedFeeINR;
}

/**
 * Get list of states requiring permits for a given nationality
 */
export function getStatesRequiringPermits(input: EligibilityInput): NEState[] {
  const result = checkPermitEligibility(input);
  return result.stateBreakdowns
    .filter(b => b.permitType !== 'None')
    .map(b => b.state);
}