> **Next.js 16 note:** APIs and conventions may differ from training data. Read `node_modules/next/dist/docs/` if something seems wrong. Heed deprecation notices.

# AGENTS.md — Master Plan for Wholesome News

## Project Overview & Stack

**App:** Wholesome News
**Overview:** An anti-doomscrolling web app that lets users explore a dark-themed interactive world map and discover positive news stories pinned by country. Stories are auto-populated every 6 hours by an AI pipeline: RSS feeds → Claude Haiku (filter + geo-tag + summarize) → Supabase → MapLibre map. Target users are 15–35 year olds who want grounding, positive content instead of algorithm-driven rage bait.
**Stack:** Next.js (TypeScript, App Router), MapLibre GL JS, Supabase (PostgreSQL), GitHub Actions (cron pipeline), Claude Haiku 4.5
**Critical Constraints:**
- Mobile-first responsive: bottom-sheet card panel on mobile, side panel on desktop
- Dark navy aesthetic (`#0a0f1e`) — no default shadcn/Radix components without custom styling
- Global coverage required — 20+ countries with pins at all times; Africa, South America, Asia, Middle East must be represented
- Free-tier budget: only Claude Haiku API costs money (~$3–7/month)
- No user auth at MVP — fully public, read-only frontend

## Setup & Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server at localhost:3000
npm run pipeline     # Run RSS + Claude pipeline manually (requires .env.local)
npm run build        # Production build
npm run lint         # ESLint check
npx tsc --noEmit     # Type check only
```

**Environment variables required (`.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPTILER_KEY=
ANTHROPIC_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Phase Roadmap

### Phase 1 — Infrastructure + Pipeline (Week 1) ← ACTIVE
- [x] Next.js scaffold + libraries installed → verify: `npm run dev` starts at localhost:3000
- [ ] Supabase `stories` table created → verify: can query `SELECT * FROM stories LIMIT 1` in Supabase SQL editor with no error
- [ ] RSS fetcher (`pipeline/fetch-rss.ts`) → verify: `node pipeline/run.ts` prints article titles to console without crashing
- [ ] Claude Haiku processor (`pipeline/process-stories.ts`) → verify: at least one story inserted into `stories` table with non-null `country_code`, `lat`, `lng`, `summary`
- [ ] GitHub Actions cron (`pipeline.yml`) → verify: manual "Run workflow" trigger in GitHub Actions tab completes green
- [ ] MapLibre map rendering with pins → verify: opening localhost:3000 shows dark map with at least one glowing pin from Supabase data
- [ ] End-to-end confirmed → verify: tap a pin, see stories from that country in the browser console (full UI in Phase 2)

### Phase 2 — UI Polish + Launch (Week 2)
- [ ] StoryPanel component (slide-up mobile / side panel desktop)
- [ ] StoryCard component with all required fields
- [ ] Custom pulsing pin animations with category colour-coding
- [ ] Playfair Display + DM Sans + Space Mono typography loaded
- [ ] 10+ RSS sources including Africa, South America, Asia, Middle East
- [ ] Mobile responsive — tested on iOS Safari + Android Chrome
- [ ] OG image + meta description for social sharing
- [ ] Analytics connected (Vercel Analytics)
- [ ] Public launch

### Phase 3 — Post-Validation Features (v2, do not build yet)
- Category filter buttons
- "Today" vs "This Week" toggle
- User accounts + bookmarks
- Native mobile app
- Story submission

## Protected Areas

Do NOT modify these without explicit approval:
- `.github/workflows/pipeline.yml` — the cron schedule and secrets configuration
- Supabase table schema — changes require a migration plan
- `.env.local` — never commit secrets
- `ANTHROPIC_API_KEY` usage — pipeline only, never expose to frontend

## Coding Conventions

See `agent_docs/code_patterns.md` for full details.

- **TypeScript:** Strict mode. No `any` — use `unknown` with type guards.
- **Files:** kebab-case (`story-card.tsx`, `fetch-rss.ts`)
- **Components:** PascalCase (`StoryCard`, `StoryPanel`, `Map`)
- **Functions/variables:** camelCase
- **Constants/env vars:** UPPER_SNAKE_CASE
- **CSS:** CSS variables from `globals.css` — never raw hex values in component styles
- **No feature creep:** Only implement features listed in the active phase above

## Agent Behaviors

These rules apply to all AI coding assistants:

1. **Read AGENTS.md first** — confirm current phase before touching code
2. **Plan Before Execution** — propose a brief step-by-step plan before changing more than one file
3. **One feature at a time** — implement, test, commit; then move to the next
4. **Verify after changes** — run `npm run build` and check browser before marking done
5. **Refactor over rewrite** — prefer small targeted edits over large rewrites
6. **Update MEMORY.md** after each milestone or architectural decision
7. **Ask if unsure** — one specific clarifying question, not multiple at once

## How I Should Think

1. **Understand intent first** — identify what the user actually needs before coding
2. **Ask if critical info is missing** — ask before proceeding, not after
3. **Plan before coding** — propose approach, wait for approval, then implement
4. **Verify after changes** — check build + browser after each feature
5. **Explain trade-offs** — when recommending something, mention alternatives briefly

## Access Control Matrix

| Environment Variable | Visibility | Runtime | Permissions |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (intentional) | Server (`/api/stories` route) | Supabase project endpoint — no auth on its own |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (intentional) | Server (`/api/stories` route) | Read-only anon access; respects RLS; cannot write |
| `NEXT_PUBLIC_MAPTILER_KEY` | Public (intentional) | Client (MapLibre tile URL) | Tile fetching only; should be domain-restricted in MapTiler dashboard |
| `ANTHROPIC_API_KEY` | **Private** | Pipeline (GitHub Actions) only | Claude API — never reaches browser or Vercel runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | **Private** | Pipeline (GitHub Actions) only | Bypasses RLS; full read/write — never reaches browser or Vercel runtime |

### User roles

| Role | Access path | Permissions |
|---|---|---|
| Anonymous visitor | Browser → `/api/stories` → Supabase anon key | Read stories (last 7 days); nothing else |
| Pipeline (GitHub Actions) | Direct Supabase service role key | Insert and delete `stories` rows |
| Developer (local) | `.env.local` + `npm run pipeline` | All of the above |

### Hard rules for all agents
- `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **never** appear in any file under `app/` or `components/`
- `/api/stories` is the only permitted path from browser to Supabase — no direct client-side Supabase calls
- Supabase RLS must enforce select-only on the `stories` table for the anon role (configured in Supabase dashboard)

## What NOT To Do

- Do NOT delete files without explicit confirmation
- Do NOT modify the Supabase schema without a backup/migration plan
- Do NOT add features not in the current phase
- Do NOT use default shadcn/Radix components without custom dark navy styling overrides
- Do NOT put AI pipeline logic (Claude API calls, RSS fetching) in Vercel serverless functions — pipeline runs in GitHub Actions only
- Do NOT commit `.env.local` or any API keys
- Do NOT bypass failing builds or type errors — fix them
- Do NOT add direct Supabase client calls to any component — all reads go through `/api/stories`

## Detailed Documentation

- `agent_docs/tech_stack.md` — Libraries, versions, setup commands, code examples
- `agent_docs/project_brief.md` — Product vision, conventions, key principles
- `agent_docs/product_requirements.md` — Full PRD: features, user stories, success metrics
- `agent_docs/code_patterns.md` — Architecture patterns, data fetching, state management
- `agent_docs/testing.md` — Testing strategy, pre-commit hooks, verification loop
