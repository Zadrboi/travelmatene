import { NextResponse } from 'next/server';
import type { PublicMetricsData } from '@/types/travel';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const metrics: PublicMetricsData = {
    kpiSummary: {
      totalDestinations: 8,
      avgBackpackerDailyINR: 1540,
      permitFreeStates: 4, // Assam, Meghalaya, Tripura, and parts of Sikkim (Nathu La needs PAP)
      verifiedTransportRoutes: 8,
    },
    stateBudgetComparison: [
      { state: 'Assam', backpackerINR: 1800, midRangeINR: 2800 },
      { state: 'Meghalaya', backpackerINR: 1400, midRangeINR: 2200 },
      { state: 'Arunachal Pradesh', backpackerINR: 2200, midRangeINR: 3500 },
      { state: 'Nagaland', backpackerINR: 1600, midRangeINR: 2600 },
      { state: 'Manipur', backpackerINR: 1500, midRangeINR: 2400 },
      { state: 'Mizoram', backpackerINR: 1200, midRangeINR: 2000 },
      { state: 'Tripura', backpackerINR: 1100, midRangeINR: 1800 },
      { state: 'Sikkim', backpackerINR: 2000, midRangeINR: 3200 },
    ],
    seasonalityMatrix: [
      {
        state: 'Assam',
        months: {
          Jan: 'Peak', Feb: 'Peak', Mar: 'Moderate', Apr: 'Moderate',
          May: 'Moderate', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Peak',
        },
      },
      {
        state: 'Meghalaya',
        months: {
          Jan: 'Peak', Feb: 'Moderate', Mar: 'Moderate', Apr: 'Moderate',
          May: 'Moderate', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Peak',
        },
      },
      {
        state: 'Arunachal Pradesh',
        months: {
          Jan: 'Low', Feb: 'Low', Mar: 'Moderate', Apr: 'Peak',
          May: 'Peak', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Moderate',
        },
      },
      {
        state: 'Nagaland',
        months: {
          Jan: 'Moderate', Feb: 'Moderate', Mar: 'Moderate', Apr: 'Moderate',
          May: 'Moderate', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Peak',
        },
      },
      {
        state: 'Manipur',
        months: {
          Jan: 'Peak', Feb: 'Moderate', Mar: 'Moderate', Apr: 'Moderate',
          May: 'Moderate', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Peak',
        },
      },
      {
        state: 'Mizoram',
        months: {
          Jan: 'Peak', Feb: 'Moderate', Mar: 'Moderate', Apr: 'Moderate',
          May: 'Moderate', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Peak',
        },
      },
      {
        state: 'Tripura',
        months: {
          Jan: 'Peak', Feb: 'Peak', Mar: 'Moderate', Apr: 'Moderate',
          May: 'Moderate', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Peak',
        },
      },
      {
        state: 'Sikkim',
        months: {
          Jan: 'Low', Feb: 'Low', Mar: 'Peak', Apr: 'Peak',
          May: 'Peak', Jun: 'Monsoon', Jul: 'Monsoon', Aug: 'Monsoon',
          Sep: 'Moderate', Oct: 'Peak', Nov: 'Peak', Dec: 'Peak',
        },
      },
    ],
    connectivityIndex: [
      {
        circuit: 'Guwahati → Shillong → Sohra (Cherrapunji)',
        state: 'Meghalaya',
        signalScore: 92,
        offlineRecommended: false,
        carriers: 'Jio 5G, Airtel 5G, BSNL 4G',
      },
      {
        circuit: 'Nongriat Root Bridge & Rainbow Falls Steps',
        state: 'Meghalaya',
        signalScore: 28,
        offlineRecommended: true,
        carriers: 'Patchy BSNL only in deep valley',
      },
      {
        circuit: 'Tezpur → Bhalukpong → Bomdila → Tawang',
        state: 'Arunachal Pradesh',
        signalScore: 48,
        offlineRecommended: true,
        carriers: 'BSNL 4G stable; Jio in main towns; Airtel drops on passes',
      },
      {
        circuit: 'Dimapur → Kohima → Dzukou Valley',
        state: 'Nagaland',
        signalScore: 55,
        offlineRecommended: true,
        carriers: 'Airtel & Jio in towns; zero cellular inside valley base camp',
      },
      {
        circuit: 'Imphal → Loktak Lake (Sendra / Moirang)',
        state: 'Manipur',
        signalScore: 84,
        offlineRecommended: false,
        carriers: 'Jio 4G/5G, Airtel 4G',
      },
      {
        circuit: 'Aizawl → Champhai → Rih Dil border',
        state: 'Mizoram',
        signalScore: 42,
        offlineRecommended: true,
        carriers: 'BSNL primary in remote border tracts',
      },
      {
        circuit: 'Agartala → Unakoti Rock Carvings',
        state: 'Tripura',
        signalScore: 78,
        offlineRecommended: false,
        carriers: 'Airtel 4G, Jio 4G',
      },
      {
        circuit: 'Gangtok → Lachung → Yumthang (North Sikkim)',
        state: 'Sikkim',
        signalScore: 35,
        offlineRecommended: true,
        carriers: 'BSNL and Jio sporadic; heavy snow cutoffs',
      },
    ],
  };

  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
