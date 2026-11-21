import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { checklistUpsertSchema } from '@/lib/validation';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const DEMO_CHECKLISTS = [
  {
    id: 'demo-chk-1',
    trip_label: 'Arunachal High-Pass Expedition',
    permit_type: 'ILP',
    items: [
      { id: 'item-1', label: 'Arunachal E-ILP Printout (2 copies)', category: 'ID & Permit', required: true, checked: true },
      { id: 'item-2', label: 'Government Photo ID (Aadhaar / Voter Card)', category: 'ID & Permit', required: true, checked: true },
      { id: 'item-3', label: 'Passport Size Photos (4 copies for checkposts)', category: 'ID & Permit', required: true, checked: false },
      { id: 'item-4', label: 'High-Altitude Diamox / Layered Woolens', category: 'Offline & Gear', required: true, checked: true },
      { id: 'item-5', label: 'Cash in INR (Limited ATMs past Tezpur)', category: 'Transport & Stay', required: true, checked: true },
      { id: 'item-6', label: 'Offline Saved Maps & Sumo Timetable', category: 'Offline & Gear', required: false, checked: true },
    ],
    updated_at: new Date().toISOString(),
  },
];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      demoMode: true,
      checklists: DEMO_CHECKLISTS,
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
          checklists: DEMO_CHECKLISTS,
        });
      }
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('document_checklists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      configured: true,
      demoMode: false,
      checklists: data || [],
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

  const parsed = checklistUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400, headers: rateLimitHeaders });
  }

  const isDemo = process.env.DEMO_MODE === 'true' || !isSupabaseConfigured();

  if (!isSupabaseConfigured() || isDemo) {
    const mockSaved = {
      id: `demo-${Date.now()}`,
      trip_label: parsed.data.tripLabel,
      permit_type: parsed.data.permitType,
      items: parsed.data.items,
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, demoMode: true, checklist: mockSaved }, { status: 200, headers: rateLimitHeaders });
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
      .from('document_checklists')
      .insert({
        user_id: user.id,
        trip_label: parsed.data.tripLabel,
        permit_type: parsed.data.permitType,
        items: parsed.data.items,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: rateLimitHeaders });
    }

    return NextResponse.json({ success: true, checklist: data }, { status: 201, headers: rateLimitHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save checklist' }, { status: 500, headers: rateLimitHeaders });
  }
}
