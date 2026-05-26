# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal

**Current Phase:** Phase 1 — Infrastructure + Pipeline
**Current Task:** Supabase table setup (requires user to create project + fill .env.local)
**Next Steps:**
1. ~~Next.js scaffold + libraries~~ ✅ Done
2. ~~Pipeline files built~~ ✅ Done (sources.ts, fetch-rss.ts, process-stories.ts, run.ts)
3. ~~GitHub Actions workflow~~ ✅ Done (.github/workflows/pipeline.yml)
4. **YOU:** Create Supabase project → run SQL schema → fill `.env.local` keys
5. Test pipeline locally: `npm run pipeline` → verify rows appear in Supabase table
6. Render MapLibre GL JS map with dark style and first test pins

## 🎨 Design System (SKILL.md applied 2026-05-22)

- Color tokens in CSS custom properties on `:root` — no raw hex in components (SKILL §6)
- Dark navy palette: `--color-bg: #080d1a`, accent `--color-accent: #38bdf8` (sky blue)
- Animation tokens: `--dur-fast: 150ms`, `--dur-base: 250ms`, `--ease-out` / `--ease-in`
- All animations use `transform`/`opacity` only — no `width`/`height`/`top` (SKILL §7)
- `@media (prefers-reduced-motion: reduce)` applied to all animations (SKILL §1)
- Touch targets ≥44px on all interactive elements — pins use 44×44 button wrapper (SKILL §2)
- `focus-visible` outlines on all interactive elements for keyboard nav (SKILL §1)
- Story panel: bottom sheet on mobile (≤768px), left sidebar on desktop (SKILL §5)
- Panel enters via `translateY(100%)→0` on mobile, `translateX(-100%)→0` on desktop
- `env(safe-area-inset-bottom)` on panel, `env(safe-area-inset-top)` on header (SKILL §5)
- SVG close icon — no emoji anywhere in UI (SKILL §4)

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
- 2026-05-22 — Reverted experimental turbopack.root from next.config.ts — caused TS2353 error; cosmetic lockfile warning is harmless
- 2026-05-22 — Pipeline runner uses `tsx` (devDep) not `ts-node` — tsx handles ESM+CJS transparently with no config
- 2026-05-22 — .cursorrules simplified to `@CLAUDE.md` reference — was duplicating CLAUDE.md verbatim

## 🐛 Known Issues & Quirks

*(Log current bugs or weird workarounds here — add as you build)*

- Supabase free projects pause after 7 days of inactivity — the GitHub Actions pipeline pings Supabase every 6 hours, which prevents the pause automatically
- MapTiler free tier: 100k tile loads/month — sufficient for MVP traffic; upgrade to MapTiler Starter ($25/mo) if exceeded
- `maplibre-gl` requires importing its CSS separately: `import 'maplibre-gl/dist/maplibre-gl.css'` in `app/layout.tsx`
- MapLibre components must be wrapped in `'use client'` directive (they use browser APIs)

## 📜 Completed Phases

- [ ] Phase 1 — Infrastructure + Pipeline (Week 1)
  - [x] Next.js 16 scaffold with TypeScript + Tailwind (2026-05-22)
  - [x] maplibre-gl, @supabase/supabase-js, rss-parser, @anthropic-ai/sdk installed
  - [x] .env.local template created
  - [x] AGENTS.md, CLAUDE.md, agent_docs/ in place
  - [x] Supabase stories table created
  - [x] RSS pipeline files written (sources.ts, fetch-rss.ts, process-stories.ts, run.ts)
  - [x] GitHub Actions cron configured (.github/workflows/pipeline.yml)
  - [x] Pipeline tested end-to-end — 73 stories stored on first run (2026-05-22)
  - [x] MapLibre map rendering with glowing pins + story panel (2026-05-22)
- [ ] Phase 2 — UI Polish + Launch (Week 2)
