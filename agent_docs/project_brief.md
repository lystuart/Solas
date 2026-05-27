# Project Brief

## Product Vision

**One-line:** Wholesome News is an interactive dark-themed world map where you explore positive news stories pinned by country — the anti-doomscrolling app.

**Core mechanic:** You open the app and see a dark map with glowing colored pins. You tap a country, a card panel slides up with 3–4 uplifting stories from that region. Every pin is auto-populated by an AI pipeline that scrapes global RSS feeds, filters for positive sentiment, and geo-tags each story with Claude Haiku.

**Why it matters:** The demand is proven (massive Instagram engagement on wholesome news accounts), but no one has built a dedicated, beautifully-designed, map-based discovery experience. All competitors are boring vertical scroll feeds.

## Target Audience

- **Age:** 15–35 year olds
- **Trait:** Chronically online but values-conscious — they want to feel informed without feeling hopeless
- **Behavior:** Would follow wholesome news Instagram accounts; shares uplifting stories with friends
- **Device split:** Web-first; mobile browsers equally important as desktop

## Key Principles

1. **The map is the hero** — no chrome, no clutter; full-screen dark map is the entire first impression
2. **Handcrafted, not generated** — custom typography (Playfair Display), custom pins, intentional whitespace; never raw component library defaults
3. **Calm over stimulation** — no red badges, no notification dots, no infinite scroll urgency
4. **Global, not Western** — 20+ countries with pins; Africa, South America, Asia, Middle East explicitly required
5. **Ship the simplest thing that works** — one feature at a time, no scope creep beyond the active phase

## Conventions

**File naming:** kebab-case for all files (`story-card.tsx`, `fetch-rss.ts`)
**Component naming:** PascalCase (`StoryCard`, `StoryPanel`, `Map`)
**Functions/variables:** camelCase
**CSS:** CSS variables only — never raw hex in component code
**Tests:** Manual browser testing for MVP; no unit test framework required at MVP scale
**Commits:** One feature per commit, descriptive messages (`feat: add story panel slide-up animation`)
**'use client':** Required on any component that uses browser APIs (MapLibre, onClick, useState, useEffect)

## Key Commands

```bash
npm run dev       # Start local dev server at localhost:3000
npm run build     # Production build (catch TypeScript errors)
npm run lint      # ESLint check
npm run pipeline  # Run RSS fetch + Claude processing manually
npx tsc --noEmit  # Type check without building
```

## Quality Gates

Before marking any feature complete:
1. `npm run build` passes without errors
2. `npx tsc --noEmit` passes (no TypeScript errors)
3. Feature tested in browser (not just "code looks right")
4. Tested at mobile width (375px) AND desktop width (1280px+)
5. `MEMORY.md` updated with any architectural decisions made

## What This Project Explicitly Does NOT Accept

- Placeholder content ("Lorem ipsum", empty states with no data) in production
- Default shadcn/Radix styling without dark navy overrides
- Any feature outside the current phase in AGENTS.md
- API keys or secrets committed to git
- TypeScript `any` types
- Pipeline logic running inside Vercel serverless functions (use GitHub Actions only)
- Map markers using the default MapLibre pin design

## Update Cadence

Update this brief when:
- A new phase begins
- A major architectural decision is made (log it in MEMORY.md too)
- A convention changes across the codebase
