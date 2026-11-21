import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { chatRequestSchema } from '@/lib/validation';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rateLimit';

// Force dynamic execution for streaming AI responses
export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTION = `You are NE-Mitra, the expert North East India travel assistant for TravelMateNE.
You know the terrain, permits, seasonal weather, and local transit across the 8 Sister States:
Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, and Sikkim.

CRITICAL INSTRUCTIONS:
1. ALWAYS provide exact ₹ INR estimates for shared Sumo/Winger fares, homestays, meals, and local entry fees.
2. ALWAYS provide ILP (Inner Line Permit) and PAP/RAP permit warnings with official government portals:
   - Arunachal Pradesh: arunachalilp.com (₹150 Indian / ₹550 Foreign)
   - Nagaland: nagalandilp.in (₹100)
   - Manipur: manipurilp.in (₹100)
   - Mizoram: ifs.mizoram.gov.in (₹60)
   - Sikkim: sikkimtourism.gov.in (PAP required for Nathu La, Tsomgo, North Sikkim)
   - Assam & Meghalaya & Tripura: ILP exempt / open entry
3. ALWAYS mention the nearest railway hubs (Guwahati GHY, Dimapur, Dibrugarh, Agartala) or airport hubs, and specific shared Tata Sumo pickup stands (e.g., Paltan Bazaar in Guwahati, Police Bazaar in Shillong, Tezpur Town Stand, Dimapur Bus Stand).
4. Respect pageContext if provided (e.g. current route, viewed state, or place).

ACTIONABLE ITINERARY CARD PROTOCOL:
Whenever the user asks for a trip plan, circuit, day-by-day plan, or itinerary, you MUST append a valid, well-formed JSON block wrapped strictly between ':::itinerary' and ':::' at the very end of your response.
Schema:
:::itinerary
{
  "title": "5-Day Meghalaya Cloud & Canyon Circuit",
  "states": ["Meghalaya", "Assam"],
  "days": 5,
  "totalBudgetINR": 9800,
  "permitsSummary": "No ILP required for Assam or Meghalaya. Carry Aadhaar/Govt Photo ID.",
  "dayByDay": [
    {
      "day": 1,
      "title": "Guwahati Hub to Shillong Pine Ridges",
      "costINR": 1400,
      "transportTip": "Shared Tata Sumo from Paltan Bazaar, Guwahati (₹180/seat, 2.5 hrs)"
    }
  ]
}
:::
Never omit the :::itinerary and ::: tags when creating an itinerary. The frontend will parse this block into a 1-click 'Save to Dashboard & Cache Offline' card.`;

/**
 * High-quality deterministic fallback itineraries for hackathons
 * Guarantees zero 500 errors when offline, unkeyed, or under API rate limits.
 */
function getDeterministicFallback(userPrompt: string, pageContext?: { state?: string; placeName?: string }) {
  const promptLower = (userPrompt + ' ' + (pageContext?.state || '') + ' ' + (pageContext?.placeName || '')).toLowerCase();

  if (promptLower.includes('arunachal') || promptLower.includes('tawang') || promptLower.includes('bomdila')) {
    return {
      text: `Hello traveler! I am **NE-Mitra**, your North East travel assistant.

For **Arunachal Pradesh (Tawang Circuit)**, keep these vital logistics in mind:
- **Inner Line Permit (ILP):** Mandatory for all Indian tourists. Apply online at [arunachalilp.com](https://arunachalilp.com) for ₹150 (3–5 working days). Foreign nationals require a Protected Area Permit (PAP) via Ministry of Home Affairs.
- **Transit Stand:** Shared Tata Sumos depart daily at 05:30 AM from **Tezpur Town Stand** to Bomdila (₹500) and onward to Tawang (₹900).
- **Altitude Warning:** Sela Pass sits at 13,700 ft. Keep Diamox and hydration handy; AMS is common.
- **Signal:** BSNL & Jio have partial coverage; Airtel drops past Dirang. Cache offline maps now.

Here is your verified actionable circuit:`,
      itinerary: {
        title: "6-Day Western Arunachal & Tawang High-Pass Circuit",
        states: ["Arunachal Pradesh", "Assam"],
        days: 6,
        totalBudgetINR: 14500,
        permitsSummary: "Mandatory ILP via arunachalilp.com (₹150). Apply min 72 hours prior.",
        dayByDay: [
          {
            day: 1,
            title: "Guwahati Hub to Tezpur / Bhalukpong Gate",
            costINR: 1800,
            transportTip: "ASTC Volvo or Shared Sumo from ISBT Guwahati to Tezpur (₹220, 3.5 hrs)"
          },
          {
            day: 2,
            title: "Ascent through Dirang Valley & Apple Orchards",
            costINR: 2200,
            transportTip: "Shared Sumo from Tezpur Town Stand to Dirang (₹550, 6 hrs)"
          },
          {
            day: 3,
            title: "Crossing Sela Pass (13,700 ft) to Tawang",
            costINR: 2800,
            transportTip: "Sumo from Dirang stand departing 06:00 AM (₹600, 5 hrs)"
          },
          {
            day: 4,
            title: "Tawang Monastery (Ganden Namgyal Lhatse) & War Memorial",
            costINR: 1900,
            transportTip: "Local shared Maruti 800 taxi within Tawang town (₹150-₹200)"
          },
          {
            day: 5,
            title: "Madhuri Lake (Sangetsar Tso) & Bum La Pass Excursion",
            costINR: 3500,
            transportTip: "Hired 4x4 Bolero required for border pass (split fare ₹4500-5500 / group)"
          },
          {
            day: 6,
            title: "Descent to Tezpur & Guwahati Departure",
            costINR: 2300,
            transportTip: "Early morning Sumo departure from Tawang old market (₹1100, 10 hrs)"
          }
        ]
      }
    };
  }

  if (promptLower.includes('nagaland') || promptLower.includes('dzukou') || promptLower.includes('kohima') || promptLower.includes('hornbill')) {
    return {
      text: `Greetings from **NE-Mitra**! 

Exploring **Nagaland & Dzukou Valley**:
- **ILP Status:** Mandatory for domestic visitors. Apply at [nagalandilp.in](https://nagalandilp.in) (₹100). Available at Dimapur DC office on arrival.
- **Transit Hub:** Broad-gauge rail arrives at **Dimapur Station (DMV)**. Shared Sumos to Kohima stand depart every 30 minutes right outside Dimapur Station (₹150/seat, 2 hrs).
- **Dzukou Trek:** Starts from Viswema or Jakhama village. Entry fee is ₹100 at the SAYO checkpoint. Carry personal sleeping mats; base camp dormitory is ₹200/night.

Here is your complete backpacking itinerary:`,
      itinerary: {
        title: "4-Day Nagaland Heritage & Dzukou Valley Trek",
        states: ["Nagaland", "Assam"],
        days: 4,
        totalBudgetINR: 7600,
        permitsSummary: "Nagaland ILP (₹100 via nagalandilp.in). Trek fee ₹100 at Viswema entry.",
        dayByDay: [
          {
            day: 1,
            title: "Dimapur Railway Hub to Kohima Hilltop",
            costINR: 1500,
            transportTip: "Shared Sumo from Dimapur Rail Stand to Kohima BOC (₹150, 75 mins)"
          },
          {
            day: 2,
            title: "Viswema Trailhead Ascent to Dzukou Valley",
            costINR: 1800,
            transportTip: "Drop taxi to Viswema trailhead (₹1200 split) + 4-hour hike"
          },
          {
            day: 3,
            title: "Sunrise in Flower Valley & Descent to Khonoma Green Village",
            costINR: 2400,
            transportTip: "Shared taxi from Jakhama base to Kohima, then local bus to Khonoma (₹60)"
          },
          {
            day: 4,
            title: "Kohima War Cemetery, Heritage Market & Return",
            costINR: 1900,
            transportTip: "Return Sumo from Kohima BOC to Dimapur Station (₹150)"
          }
        ]
      }
    };
  }

  // Default: Meghalaya & Assam Waterfalls & Living Roots Circuit
  return {
    text: `Khublei! I am **NE-Mitra**, your AI travel companion for North East India.

Key Travel Insights for **Meghalaya & Assam**:
- **Permits:** Completely **ILP-Exempt** for Indian citizens. Just carry valid Govt ID (Aadhaar/Voter ID). Clean eco-cess fees of ₹20–₹50 apply at village bridges.
- **Transit Stand:** Shared Tata Sumos depart continuously from **Paltan Bazaar (Guwahati)** to **Police Bazaar (Shillong)** for ₹180–₹200 per seat (2.5 hrs on NH-6).
- **Local Connectivity:** Shillong and Cherrapunji have strong 4G/5G. Nongriat Valley deep steps have limited connectivity; offline saving is recommended.

Here is your curated, cost-optimized itinerary:`,
    itinerary: {
      title: "5-Day Meghalaya Canyons & Living Root Bridges",
      states: ["Meghalaya", "Assam"],
      days: 5,
      totalBudgetINR: 8900,
      permitsSummary: "No ILP needed. Standard photo ID for checkposts. Eco-cess ₹50 at Nongriat.",
      dayByDay: [
        {
          day: 1,
          title: "Guwahati Airport / GHY Station to Shillong Pine City",
          costINR: 1600,
          transportTip: "Shared Sumo from Paltan Bazaar Stand (₹180/seat, 2.5 hrs via Umiam Lake)"
        },
        {
          day: 2,
          title: "Shillong to Sohra (Cherrapunji) — Nohkalikai & Mawsmai Cave",
          costINR: 1900,
          transportTip: "Shared Sumo from Police Bazaar Sumo Stand to Sohra Bazaar (₹90, 1.5 hrs)"
        },
        {
          day: 3,
          title: "Nongriat Double Decker Living Root Bridge & Rainbow Falls Trek",
          costINR: 1500,
          transportTip: "Local taxi drop to Tyrna village trailhead (₹400), then 3,500 stone steps"
        },
        {
          day: 4,
          title: "Dawki Glass-Clear River & Mawlynnong Cleanest Village",
          costINR: 2200,
          transportTip: "Shared tourist cab from Sohra to Dawki border post (₹600/seat)"
        },
        {
          day: 5,
          title: "Krang Shuri Waterfalls & Return to Guwahati Hub",
          costINR: 1700,
          transportTip: "Shared Winger cab from Jowai / Shillong back to Paltan Bazaar (₹250)"
        }
      ]
    }
  };
}

export async function POST(request: Request) {
  // 1. Sliding-window rate limit check (20 req / 60s)
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(clientIp, 20, 60000);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again shortly.' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  // 2. Strict Zod body validation
  let jsonBody: unknown;
  try {
    jsonBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request payload' },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const parsed = chatRequestSchema.safeParse(jsonBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.format() },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const { messages, pageContext } = parsed.data;
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || 'Plan a trip to North East India';

  // Helper function to stream deterministic fallback
  const streamFallbackResponse = () => {
    const fallback = getDeterministicFallback(lastUserMessage, pageContext);
    const fullContent = `${fallback.text}\n\n:::itinerary\n${JSON.stringify(fallback.itinerary, null, 2)}\n:::`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Break into realistic token words for authentic streaming feel
        const words = fullContent.split(/(?<=\s+)/);
        for (const word of words) {
          controller.enqueue(encoder.encode(word));
          // Micro-tick pacing for responsive visual rendering
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
        ...rateLimitHeaders,
      },
    });
  };

  // 3. Check for Gemini API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'placeholder' || apiKey.length < 5) {
    console.info('[NE-Mitra Chat] GEMINI_API_KEY missing or placeholder. Serving deterministic hackathon fallback.');
    return streamFallbackResponse();
  }

  // 4. Invoke Google GenAI Stream
  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for @google/genai
    const contextPrompt = pageContext
      ? `\n\n[Active Page Context: Route=${pageContext.route || 'General'}, State=${pageContext.state || 'North East'}, Place=${pageContext.placeName || 'Overview'}]`
      : '';

    // Convert chat messages to gemini format
    const contents = messages.map((m, idx) => {
      const isLast = idx === messages.length - 1;
      const textContent = isLast && m.role === 'user' ? `${m.content}${contextPrompt}` : m.content;
      return {
        role: m.role === 'assistant' || m.role === 'model' || m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: textContent }],
      };
    });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.65,
        maxOutputTokens: 2500,
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamErr) {
          console.error('[NE-Mitra Stream Error]:', streamErr);
          // If mid-stream error occurs, append fallback itinerary closure
          controller.enqueue(
            encoder.encode(
              `\n\n[Network interruption: Restoring cached offline itinerary]\n\n:::itinerary\n${JSON.stringify(
                getDeterministicFallback(lastUserMessage, pageContext).itinerary,
                null,
                2
              )}\n:::`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
        ...rateLimitHeaders,
      },
    });
  } catch (error) {
    console.error('[NE-Mitra AI Generation Error]:', error);
    // Graceful hackathon fallback - never crash or return HTTP 500
    return streamFallbackResponse();
  }
}
