import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { itinerarySaveSchema } from '@/lib/validation';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const DEMO_SAVED_ITINERARIES = [
  {
    id: 'demo-itin-1',
    title: '5-Day Meghalaya Canyons & Living Root Bridges',
    states: ['Meghalaya', 'Assam'],
    days: 5,
    total_budget_inr: 8900,
    permits_summary: 'No ILP required for Assam or Meghalaya. Standard Indian photo ID required.',
    plan_json: {
      dayByDay: [
        {
          day: 1,
          title: 'Guwahati Rail Hub to Shillong Pine City',
          costINR: 1600,
          transportTip: 'Shared Sumo from Paltan Bazaar Stand (₹180/seat, 2.5 hrs)',
        },
        {
          day: 2,
          title: 'Shillong to Sohra (Cherrapunji) — Nohkalikai & Mawsmai Cave',
          costINR: 1900,
          transportTip: 'Shared Sumo from Police Bazaar to Sohra (₹90, 1.5 hrs)',
        },
        {
          day: 3,
          title: 'Nongriat Double Decker Living Root Bridge & Rainbow Falls',
          costINR: 1500,
          transportTip: 'Local taxi drop to Tyrna village trailhead (₹400) + steps hike',
        },
        {
          day: 4,
          title: 'Dawki Emerald Umngot River & Mawlynnong Cleanest Village',
          costINR: 2200,
          transportTip: 'Shared tourist cab to Dawki border post (₹600/seat)',
        },
        {
          day: 5,
          title: 'Krang Shuri Cascades & Return to Guwahati Station',
          costINR: 1700,
          transportTip: 'Shared Winger cab from Jowai to Paltan Bazaar (₹250)',
        },
      ],
    },
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      demoMode: true,
      itineraries: DEMO_SAVED_ITINERARIES,
    });
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const isDemo = process.env.DEMO_MODE === 'true';

    if (authError || !user) {
      if (isDemo) {
        return NextResponse.json({
          configured: true,
          demoMode: true,
          itineraries: DEMO_SAVED_ITINERARIES,
        });
      }
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('saved_itineraries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      configured: true,
      demoMode: false,
      itineraries: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Rate limiting: 20 requests per 60 seconds
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(clientIp, 20, 60000);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: rateLimitHeaders });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400, headers: rateLimitHeaders });
  }

  const parsed = itinerarySaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400, headers: rateLimitHeaders });
  }

  const isDemo = process.env.DEMO_MODE === 'true' || !isSupabaseConfigured();

  if (!isSupabaseConfigured() || isDemo) {
    const mockSaved = {
      id: `demo-${Date.now()}`,
      title: parsed.data.title,
      states: parsed.data.states,
      days: parsed.data.days,
      total_budget_inr: parsed.data.totalBudgetINR,
      permits_summary: parsed.data.permitsSummary || 'Verified permit guidelines attached.',
      plan_json: { dayByDay: parsed.data.dayByDay },
      created_at: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, demoMode: true, itinerary: mockSaved }, { status: 201, headers: rateLimitHeaders });
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401, headers: rateLimitHeaders });
    }

    const { data, error } = await supabase
      .from('saved_itineraries')
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        states: parsed.data.states,
        days: parsed.data.days,
        total_budget_inr: parsed.data.totalBudgetINR,
        permits_summary: parsed.data.permitsSummary || null,
        plan_json: { dayByDay: parsed.data.dayByDay },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: rateLimitHeaders });
    }

    return NextResponse.json({ success: true, itinerary: data }, { status: 201, headers: rateLimitHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save itinerary' }, { status: 500, headers: rateLimitHeaders });
  }
}
