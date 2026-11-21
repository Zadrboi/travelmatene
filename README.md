# travelmatene

# TravelMateNE — Civic & Eco-Tourism Gateway for North East India

**TravelMateNE** is a full-stack tourism, transit, and regulatory permit platform built for the eight states of North East India (**Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura**). It combines verified shared-mobility fares, deterministic Inner-Line Permit (ILP) checks, ecological carrying-capacity insights, offline PWA caching, and an AI travel co-pilot (**NE-Mitra AI**).

---

## Key Features

- **Curated 8-State Destination Directory (`/explore`)**
  - 32 verified destinations (4 per state) with altitude, daily cost estimates, crowd indices, permit status, and full-text filtering by state, category, and daily budget tier.
- **Deterministic Permit & Eligibility Engine (`/permits/checker`)**
  - Instant rule-based verification for **Inner-Line Permits (ILP)**, **Protected Area Permits (PAP)**, and **Restricted Area Permits (RAP)** across domestic and international travelers, paired with downloadable/interactive document checklists.
- **Regional Shared-Transit & Corridor Matrix (`/transport`)**
  - 45 verified inter-state and hill-circuit routes featuring transparent shared Tata Sumo / cruiser fares, travel durations, hub departure stands, and Border Roads Organisation (BRO) pass advisories.
- **Tourism & Ecological Insights (`/insights`)**
  - Interactive data visualizations powered by **Recharts** tracking seasonal visitor influx, state-wise eco-tourism capacity, and permit processing metrics.
- **NE-Mitra AI Travel Co-Pilot**
  - Floating conversational assistant powered by **Google Gemini (`gemini-2.5-flash`)** for itinerary planning, permit guidance, and local transit advice.
- **Authenticated Traveler Dashboard (`/dashboard`)**
  - Backed by **Supabase Auth** and **PostgreSQL Row-Level Security (RLS)** so travelers can save custom circuits and track permit readiness securely.
- **Offline-First PWA & Low-Bandwidth Lite Mode**
  - Installable Progressive Web App (`manifest.json` + service worker) with a one-click **Lite Mode** toggle designed for high-altitude connectivity zones.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React, TypeScript |
| **Styling & Motion** | Tailwind CSS, Custom Editorial Typography (`Bodoni Moda` + Sans), Motion Choreography |
| **Backend & Auth** | Supabase (PostgreSQL, Row-Level Security, Email & OAuth Authentication) |
| **AI Integration** | Google GenAI SDK (`gemini-2.5-flash`) |
| **Maps & Data Viz** | Leaflet.js, Recharts |
| **Offline & PWA** | Web App Manifest, Service Worker, Local Storage Sync |

---

## Project Structure

```text
├── public/                 # PWA manifest, service worker, icons, and static assets
├── supabase/
│   └── schema.sql          # PostgreSQL tables, triggers, and RLS policies
├── src/
│   ├── app/                # Next.js App Router pages ((auth), dashboard, explore, insights, permits, transport, api)
│   ├── components/         # Navbar, MistyHero, QuickFactsSpotlight, ChatWidget, MobileBottomNav, UI modules
│   ├── context/            # Motion preference & client state providers
│   ├── data/               # Curated datasets (destinations, transportRoutes, permitsData, publicMetrics)
│   ├── lib/                # Supabase clients, deterministic eligibilityEngine, rate limiting, validation
│   └── types/              # TypeScript domain interfaces
├── .env.example            # Required environment variable template
└── package.json

1. Clone & Install Dependencies
Bash
git clone [https://github.com/Zadrboi/travelmatene.git](https://github.com/Zadrboi/travelmatene.git)
cd travelmatene
npm install

Configure Environment Variables
Copy .env.example to .env.local and fill in your credentials:

Bash
cp .env.example .env.local

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key

4. Start the Development Server
Bash
npm run dev
