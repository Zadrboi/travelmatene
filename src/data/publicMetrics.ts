import type { PublicMetricsData, NEState } from '@/types/travel';

export const PUBLIC_METRICS: PublicMetricsData = {
  kpiSummary: {
    totalDestinations: 32,
    avgBackpackerDailyINR: 1788,
    permitFreeStates: 3,
    verifiedTransportRoutes: 48
  },

  stateBudgetComparison: [
    { state: 'Assam', backpackerINR: 1700, midRangeINR: 2800 },
    { state: 'Meghalaya', backpackerINR: 1525, midRangeINR: 2400 },
    { state: 'Arunachal Pradesh', backpackerINR: 2625, midRangeINR: 4200 },
    { state: 'Nagaland', backpackerINR: 1725, midRangeINR: 2800 },
    { state: 'Manipur', backpackerINR: 1425, midRangeINR: 2300 },
    { state: 'Mizoram', backpackerINR: 1500, midRangeINR: 2200 },
    { state: 'Tripura', backpackerINR: 1100, midRangeINR: 1800 },
    { state: 'Sikkim', backpackerINR: 2150, midRangeINR: 3400 }
  ],

  seasonalityMatrix: [
    {
      state: 'Assam',
      months: {
        Jan: 'Peak', Feb: 'Peak', Mar: 'Moderate', Apr: 'Moderate',
        May: 'Low', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Monsoon', Oct: 'Moderate', Nov: 'Peak', Dec: 'Peak'
      }
    },
    {
      state: 'Meghalaya',
      months: {
        Jan: 'Peak', Feb: 'Peak', Mar: 'Moderate', Apr: 'Moderate',
        May: 'Low', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Monsoon', Oct: 'Moderate', Nov: 'Peak', Dec: 'Peak'
      }
    },
    {
      state: 'Arunachal Pradesh',
      months: {
        Jan: 'Low', Feb: 'Low', Mar: 'Moderate', Apr: 'Moderate',
        May: 'Moderate', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Moderate'
      }
    },
    {
      state: 'Nagaland',
      months: {
        Jan: 'Moderate', Feb: 'Moderate', Mar: 'Moderate', Apr: 'Moderate',
        May: 'Low', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Low', Oct: 'Moderate', Nov: 'Peak', Dec: 'Peak'
      }
    },
    {
      state: 'Manipur',
      months: {
        Jan: 'Peak', Feb: 'Peak', Mar: 'Moderate', Apr: 'Moderate',
        May: 'Low', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Low', Oct: 'Moderate', Nov: 'Peak', Dec: 'Peak'
      }
    },
    {
      state: 'Mizoram',
      months: {
        Jan: 'Peak', Feb: 'Peak', Mar: 'Moderate', Apr: 'Moderate',
        May: 'Low', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Low', Oct: 'Moderate', Nov: 'Peak', Dec: 'Peak'
      }
    },
    {
      state: 'Tripura',
      months: {
        Jan: 'Peak', Feb: 'Peak', Mar: 'Moderate', Apr: 'Moderate',
        May: 'Low', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Monsoon', Oct: 'Moderate', Nov: 'Peak', Dec: 'Peak'
      }
    },
    {
      state: 'Sikkim',
      months: {
        Jan: 'Low', Feb: 'Low', Mar: 'Moderate', Apr: 'Peak',
        May: 'Peak', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
        Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Moderate'
      }
    }
  ],

  connectivityIndex: [
    {
      circuit: 'Guwahati → Kaziranga → Jorhat → Majuli',
      state: 'Assam',
      signalScore: 85,
      offlineRecommended: false,
      carriers: 'Jio, Airtel, BSNL, Vi — excellent 4G on highways'
    },
    {
      circuit: 'Guwahati → Shillong → Cherrapunji → Dawki',
      state: 'Meghalaya',
      signalScore: 65,
      offlineRecommended: true,
      carriers: 'Jio/Airtel good in Shillong; Patchy at Nongriat, Dawki, Laitlum; BSNL best in valleys'
    },
    {
      circuit: 'Guwahati → Tezpur → Bhalukpong → Bomdila → Tawang',
      state: 'Arunachal Pradesh',
      signalScore: 40,
      offlineRecommended: true,
      carriers: 'BSNL only reliable beyond Bomdila; Jio/Airtel intermittent; Sela Pass: Offline'
    },
    {
      circuit: 'Itanagar → Ziro Valley',
      state: 'Arunachal Pradesh',
      signalScore: 55,
      offlineRecommended: true,
      carriers: 'Jio/Airtel in Ziro town; BSNL in villages; Talley Valley: Offline'
    },
    {
      circuit: 'Siliguri → Gangtok → Tsomgo → Nathula',
      state: 'Sikkim',
      signalScore: 70,
      offlineRecommended: false,
      carriers: 'Jio/Airtel/BSNL good to Gangtok; Patchy at Tsomgo/Nathula'
    },
    {
      circuit: 'Gangtok → Lachung → Yumthang → Zero Point',
      state: 'Sikkim',
      signalScore: 30,
      offlineRecommended: true,
      carriers: 'BSNL only at Lachung; Jio/Airtel dead beyond Chungthang; Zero Point: Offline'
    },
    {
      circuit: 'Gangtok → Pelling → Ravangla',
      state: 'Sikkim',
      signalScore: 75,
      offlineRecommended: false,
      carriers: 'Jio/Airtel/BSNL reliable throughout West Sikkim'
    },
    {
      circuit: 'Dimapur → Kohima → Kisama → Dzukou Valley',
      state: 'Nagaland',
      signalScore: 60,
      offlineRecommended: true,
      carriers: 'Jio/Airtel in Kohima/Dimapur; BSNL at Dzukou base; Valley trek: Offline'
    },
    {
      circuit: 'Kohima → Khonoma → Mon (Longwa)',
      state: 'Nagaland',
      signalScore: 50,
      offlineRecommended: true,
      carriers: 'Jio/Airtel in Kohima/Mon; Longwa border village: BSNL only; Patchy en route'
    },
    {
      circuit: 'Imphal → Loktak → Moirang → Ukhrul (Shirui)',
      state: 'Manipur',
      signalScore: 65,
      offlineRecommended: true,
      carriers: 'Jio/Airtel/BSNL in Imphal valley; Ukhrul town: Jio/BSNL; Shirui peak: Offline'
    },
    {
      circuit: 'Aizawl → Reiek → Thenzawl → Phawngpui',
      state: 'Mizoram',
      signalScore: 55,
      offlineRecommended: true,
      carriers: 'Jio/Airtel in Aizawl; BSNL at Phawngpui/Sangau; Hmuifang: Patchy'
    },
    {
      circuit: 'Agartala → Neermahal → Unakoti → Sepahijala',
      state: 'Tripura',
      signalScore: 80,
      offlineRecommended: false,
      carriers: 'Jio/Airtel/BSNL/Vi excellent throughout; 4G on all highways'
    }
  ]
};

/**
 * Helper to get seasonality for a specific state and month
 */
export function getSeasonality(state: NEState, month: string): 'Low' | 'Moderate' | 'Peak' | 'Monsoon' {
  const entry = PUBLIC_METRICS.seasonalityMatrix.find(s => s.state === state);
  return entry?.months[month] || 'Moderate';
}

/**
 * Helper to get connectivity info for a circuit
 */
export function getConnectivity(circuit: string) {
  return PUBLIC_METRICS.connectivityIndex.find(c => c.circuit === circuit);
}

/**
 * Get average backpacker budget across all states
 */
export function getAverageBackpackerBudget(): number {
  const sum = PUBLIC_METRICS.stateBudgetComparison.reduce((acc, s) => acc + s.backpackerINR, 0);
  return Math.round(sum / PUBLIC_METRICS.stateBudgetComparison.length);
}