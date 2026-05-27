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
# Install dependencies
npm install

# Start development server
npm run dev

# Run the RSS pipeline manually (requires .env.local with API keys)
npm run pipeline

# Build for production
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
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
- [ ] Next.js project scaffold with TypeScript + Tailwind
- [ ] Supabase `stories` table created and queryable
- [ ] RSS fetcher pulling from 5 starter sources
- [ ] Claude Haiku processor (filter + geo-tag + summarize in one call)
- [ ] GitHub Actions cron running every 6 hours
- [ ] MapLibre GL JS map rendering with dark style and basic pins
- [ ] End-to-end loop confirmed: pipeline → Supabase → map

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

## What NOT To Do

- Do NOT delete files without explicit confirmation
- Do NOT modify the Supabase schema without a backup/migration plan
- Do NOT add features not in the current phase
- Do NOT use default shadcn/Radix components without custom dark navy styling overrides
- Do NOT put AI pipeline logic (Claude API calls, RSS fetching) in Vercel serverless functions — pipeline runs in GitHub Actions only
- Do NOT commit `.env.local` or any API keys
- Do NOT bypass failing builds or type errors — fix them

## Detailed Documentation

- `agent_docs/tech_stack.md` — Libraries, versions, setup commands, code examples
- `agent_docs/project_brief.md` — Product vision, conventions, key principles
- `agent_docs/product_requirements.md` — Full PRD: features, user stories, success metrics
- `agent_docs/code_patterns.md` — Architecture patterns, data fetching, state management
- `agent_docs/testing.md` — Testing strategy, pre-commit hooks, verification loop
