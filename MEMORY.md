# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal

**Current Phase:** Phase 1 — Infrastructure + Pipeline
**Current Task:** Project not yet scaffolded — begin here
**Next Steps:**
1. Run `npx create-next-app@latest wholesome-news --typescript --tailwind --app`
2. Install core libraries: `npm install maplibre-gl @supabase/supabase-js rss-parser @anthropic-ai/sdk`
3. Create Supabase `stories` table (SQL schema in `agent_docs/tech_stack.md`)
4. Create `.env.local` with all required keys (see AGENTS.md)
5. Build RSS fetch pipeline (`pipeline/fetch-rss.ts` + `pipeline/sources.ts`)
6. Build Claude Haiku processor (`pipeline/process-stories.ts`)
7. Wire up GitHub Actions cron (`.github/workflows/pipeline.yml`)
8. Render MapLibre GL JS map with dark style and first test pins

## 📂 Architectural Decisions

*(Log specific choices made during the build here so future agents respect them)*

- 2026-05-22 — Chose MapLibre GL JS over Leaflet for full WebGL rendering, dark theme control, and custom pin support
- 2026-05-22 — Chose Supabase over PlanetScale/Firebase for auto-generated REST API (zero backend code for the map to fetch stories)
- 2026-05-22 — AI pipeline runs in GitHub Actions, NOT in Vercel serverless functions (Vercel free tier times out at 10s — insufficient for RSS fetch + Claude calls)
- 2026-05-22 — Using standard Claude Haiku API (not Batch API) for the live pipeline — batch has 24h response delay, incompatible with 6-hour refresh cycle
- 2026-05-22 — Skipping Reddit r/UpliftingNews — Reddit API ToS change makes scraping non-viable for MVP; using RSS sources instead
- 2026-05-22 — Stories without a confidently-extracted country_code are skipped and not stored — no guessing on geo-tags
- 2026-05-22 — Map tile provider: MapTiler free tier (dataviz-dark style) as primary; OpenFreeMap as fallback with no API key required
- 2026-05-22 — No user auth at MVP — Supabase RLS set to public read-only for the `stories` table

## 🐛 Known Issues & Quirks

*(Log current bugs or weird workarounds here — add as you build)*

- Supabase free projects pause after 7 days of inactivity — the GitHub Actions pipeline pings Supabase every 6 hours, which prevents the pause automatically
- MapTiler free tier: 100k tile loads/month — sufficient for MVP traffic; upgrade to MapTiler Starter ($25/mo) if exceeded
- `maplibre-gl` requires importing its CSS separately: `import 'maplibre-gl/dist/maplibre-gl.css'` in `app/layout.tsx`
- MapLibre components must be wrapped in `'use client'` directive (they use browser APIs)

## 📜 Completed Phases

- [ ] Phase 1 — Infrastructure + Pipeline (Week 1)
- [ ] Phase 2 — UI Polish + Launch (Week 2)
