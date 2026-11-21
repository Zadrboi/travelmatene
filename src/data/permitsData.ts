import type { PermitRule, PermitType, NEState } from '@/types/travel';

export const PERMIT_RULES: PermitRule[] = [
  {
    state: 'Arunachal Pradesh',
    indianPermit: 'ILP',
    foreignPermit: 'RAP',
    indianFeeINR: 150,
    foreignFeeINR: 550,
    validityDays: 30,
    processingTime: '24–48 hours online; same day at issuing office',
    officialPortalUrl: 'https://eilp.arunachal.gov.in',
    checkposts: ['Bhalukpong', 'Banderdawa', 'Gumto', 'Dibrugarh entry'],
    notes: 'Indian citizens from Arunachal Pradesh exempt. ILP required for all other Indians. Foreign nationals need Restricted Area Permit (RAP) from MHA — apply 60+ days prior. Group RAP available for 2+ foreigners.',
    lastVerified: 'Nov 2026'
  },
  {
    state: 'Nagaland',
    indianPermit: 'ILP',
    foreignPermit: 'RAP',
    indianFeeINR: 100,
    foreignFeeINR: 500,
    validityDays: 30,
    processingTime: '2–4 hours online; 30 min at Dimapur airport/Kohima DC office',
    officialPortalUrl: 'https://nagalandilp.in',
    checkposts: ['Dimapur (airport & railway)', 'Kohima DC Office', 'Mokokchung', 'Tuensang'],
    notes: 'Indian citizens from Nagaland exempt. ILP available online or on arrival at Dimapur airport/railway. Foreign nationals need RAP from MHA (Kohima/Dimapur only for groups of 4+). Hornbill Festival period: apply early.',
    lastVerified: 'Nov 2026'
  },
  {
    state: 'Manipur',
    indianPermit: 'ILP',
    foreignPermit: 'RAP',
    indianFeeINR: 100,
    foreignFeeINR: 500,
    validityDays: 30,
    processingTime: '24 hours online; same day at Imphal DC office',
    officialPortalUrl: 'https://manipurilp.in',
    checkposts: ['Imphal Airport', 'Imphal DC Office', 'Moreh Border', 'Jiribam'],
    notes: 'Indian citizens from Manipur exempt. ILP mandatory for all other Indians including Moreh border area. Foreign nationals need RAP from MHA — limited to Imphal Valley only; hill districts prohibited.',
    lastVerified: 'Nov 2026'
  },
  {
    state: 'Mizoram',
    indianPermit: 'ILP',
    foreignPermit: 'RAP',
    indianFeeINR: 60,
    foreignFeeINR: 500,
    validityDays: 15,
    processingTime: '2–4 hours online; same day at Lengpui Airport/Aizawl DC office',
    officialPortalUrl: 'https://ifs.mizoram.gov.in',
    checkposts: ['Lengpui Airport', 'Aizawl DC Office', 'Kawnpui', 'Vairengte'],
    notes: 'Indian citizens from Mizoram exempt. ILP valid 15 days (extendable to 30). Foreign nationals need RAP from MHA — restricted to Aizawl and Lunglei districts only. Inner zones prohibited.',
    lastVerified: 'Nov 2026'
  },
  {
    state: 'Sikkim',
    indianPermit: 'None',
    foreignPermit: 'RAP',
    indianFeeINR: 0,
    foreignFeeINR: 0,
    validityDays: 0,
    processingTime: 'PAP: 24 hrs at Gangtok/Mangan; RAP: 60+ days via MHA',
    officialPortalUrl: 'https://sikkimtourism.gov.in',
    checkposts: ['Rangpo (West Bengal border)', 'Melli (West Bengal border)'],
    notes: 'Indians: No permit required for most areas. Protected Area Permit (PAP) required for Indians visiting Tsomgo Lake, Nathula Pass, North Sikkim (Lachung/Lachen), Zero Point — obtain at Gangtok/Mangan. Foreign nationals: RAP from MHA required for ALL of Sikkim; PAP additionally for restricted zones. Groups of 2+ foreigners can get RAP at Gangtok.',
    lastVerified: 'Nov 2026'
  },
  {
    state: 'Assam',
    indianPermit: 'None',
    foreignPermit: 'None',
    indianFeeINR: 0,
    foreignFeeINR: 0,
    validityDays: 0,
    processingTime: 'N/A',
    officialPortalUrl: 'https://tourism.assam.gov.in',
    checkposts: [],
    notes: 'Permit-free for all nationalities. Kaziranga National Park requires pre-booked safari entry (separate from permits). Some remote border areas near Arunachal may have local checks.',
    lastVerified: 'Nov 2026'
  },
  {
    state: 'Meghalaya',
    indianPermit: 'None',
    foreignPermit: 'None',
    indianFeeINR: 0,
    foreignFeeINR: 0,
    validityDays: 0,
    processingTime: 'N/A',
    officialPortalUrl: 'https://meghalayatourism.in',
    checkposts: [],
    notes: 'Permit-free for all nationalities. Eco-cess ₹50 at some sites (Nongriat, Mawlynnong). Border areas near Dawki may require ID check by BSF.',
    lastVerified: 'Nov 2026'
  },
  {
    state: 'Tripura',
    indianPermit: 'None',
    foreignPermit: 'None',
    indianFeeINR: 0,
    foreignFeeINR: 0,
    validityDays: 0,
    processingTime: 'N/A',
    officialPortalUrl: 'https://tripuratourism.gov.in',
    checkposts: [],
    notes: 'Permit-free for all nationalities. Some border-adjacent areas near Bangladesh may have BSF checks — carry ID. No ILP/RAP required anywhere in the state.',
    lastVerified: 'Nov 2026'
  }
];

// Helper to get permit rule by state
export function getPermitRule(state: NEState): PermitRule | undefined {
  return PERMIT_RULES.find(rule => rule.state === state);
}

// Helper to get all ILP states
export const ILP_STATES: NEState[] = ['Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram'];

// Helper to get all permit-free states
export const PERMIT_FREE_STATES: NEState[] = ['Assam', 'Meghalaya', 'Tripura'];

// Helper to get PAP/RAP states
export const PAP_STATES: NEState[] = ['Sikkim'];
export const RAP_STATES: NEState[] = ['Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Sikkim'];