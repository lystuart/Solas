# Tech Stack & Tools

## Core Stack

- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS)
- **Map Library:** MapLibre GL JS — WebGL-rendered vector maps, full style control
- **Map Tiles:** MapTiler `dataviz-dark` style (free tier, API key required) or OpenFreeMap (unlimited, no key)
- **Database:** Supabase — hosted PostgreSQL with auto-generated REST API
- **Backend/API:** Supabase REST API (no custom backend needed for the map frontend)
- **Pipeline Runtime:** GitHub Actions (Node.js 20) — cron schedule every 6 hours
- **AI:** Claude Haiku 4.5 via `@anthropic-ai/sdk` — filter + geo-tag + summarize
- **RSS Parsing:** `rss-parser` npm package
- **Deployment:** Vercel (frontend auto-deploys on git push to main)
- **Authentication:** None at MVP — public read-only

## Install Commands

```bash
# Create project
npx create-next-app@latest wholesome-news --typescript --tailwind --app
cd wholesome-news

# Core dependencies
npm install maplibre-gl @supabase/supabase-js rss-parser @anthropic-ai/sdk

# Dev dependencies
npm install -D @types/node

# Verify install
npm run dev
```

## Project Structure

```
wholesome-news/
├── app/
│   ├── page.tsx              # Main map page (home)
│   ├── layout.tsx            # Root layout — fonts, global CSS, MapLibre CSS
│   └── globals.css           # CSS variables, dark navy palette, pin animations
├── components/
│   ├── Map.tsx               # MapLibre GL JS wrapper ('use client')
│   ├── StoryPanel.tsx        # Country card overlay — slide-up/side panel ('use client')
│   ├── StoryCard.tsx         # Individual story card (server component OK)
│   └── CategoryFilter.tsx    # Filter buttons (nice-to-have, Phase 2)
├── lib/
│   ├── supabase.ts           # Public read-only Supabase client
│   └── types.ts              # TypeScript interfaces (Story, Category, etc.)
├── pipeline/
│   ├── sources.ts            # RSS feed URL list
│   ├── fetch-rss.ts          # Fetches + parses RSS feeds
│   ├── process-stories.ts    # Claude Haiku processor + Supabase writer
│   └── run.ts                # Pipeline entry point
├── .env.local                # Secret keys — NEVER commit
├── .github/
│   └── workflows/
│       └── pipeline.yml      # GitHub Actions cron
└── package.json
```

## Database Schema (Supabase)

Run this SQL in the Supabase SQL Editor to create the table:

```sql
CREATE TABLE stories (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  url           TEXT        NOT NULL,
  url_hash      TEXT        UNIQUE NOT NULL,
  source        TEXT        NOT NULL,
  country       TEXT,
  country_code  CHAR(2),
  lat           DECIMAL(9,6),
  lng           DECIMAL(10,6),
  summary       TEXT,
  category      TEXT CHECK (category IN ('environment','health','community','science','other')),
  published_at  TIMESTAMPTZ,
  processed_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stories_country   ON stories(country_code);
CREATE INDEX idx_stories_category  ON stories(category);
CREATE INDEX idx_stories_published ON stories(published_at DESC);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON stories FOR SELECT USING (true);
```

## TypeScript Types — `lib/types.ts`

```typescript
export type Category = 'environment' | 'health' | 'community' | 'science' | 'other'

export interface Story {
  id: string
  title: string
  url: string
  url_hash: string
  source: string
  country: string | null
  country_code: string | null
  lat: number | null
  lng: number | null
  summary: string | null
  category: Category
  published_at: string
  processed_at: string
}

export interface CountryPin {
  country: string
  country_code: string
  lat: number
  lng: number
  category: Category   // dominant category for pin colour
  story_count: number
}
```

## Supabase Client — `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Public client — read-only, safe for browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## CSS Variables (dark navy palette) — `app/globals.css`

```css
:root {
  /* Map colours */
  --map-bg:      #0a0f1e;
  --map-water:   #0d1b2a;
  --map-land:    #131c2e;
  --map-border:  #1e3a5f;

  /* Category pin colours */
  --pin-environment: #4ade80;
  --pin-health:      #60a5fa;
  --pin-community:   #fbbf24;
  --pin-science:     #a78bfa;
  --pin-other:       #94a3b8;

  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'Space Mono', monospace;

  /* Text */
  --text-primary: #e2e8f0;
  --text-muted:   #64748b;

  /* Glass panel */
  --panel-bg:     rgba(10, 15, 30, 0.92);
  --panel-border: rgba(255, 255, 255, 0.08);
}
```

## Error Handling Pattern

```typescript
// Wrap all external calls (Supabase, Claude, RSS) in try/catch
// Log errors server-side, never expose raw errors to the UI
// Pipeline: log and continue if one RSS feed fails — don't crash the whole run

async function fetchFeed(source: RssSource): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items.map(item => toRawArticle(item, source))
  } catch (err) {
    // Log the error but keep the pipeline running
    console.error(`[pipeline] Failed to fetch ${source.name}:`, (err as Error).message)
    return []
  }
}

// Supabase query pattern — always destructure error
const { data, error } = await supabase.from('stories').select('*')
if (error) {
  console.error('[supabase] Query failed:', error.message)
  return []
}
```

## Styling Pattern — Custom Component Example

```tsx
// Never use raw hex values in components — always use CSS variables
// Never use unstyled shadcn/Radix defaults

export function CategoryTag({ category }: { category: Category }) {
  return (
    <span
      className="category-tag"
      data-category={category}  // CSS targets data-category for colour
    >
      {category}
    </span>
  )
}
```

```css
/* In globals.css — data attribute targeting for category colours */
.category-tag { font-family: var(--font-mono); font-size: 0.65rem; padding: 2px 8px; border-radius: 12px; }
.category-tag[data-category="environment"] { background: #4ade8022; color: var(--pin-environment); }
.category-tag[data-category="health"]      { background: #60a5fa22; color: var(--pin-health); }
.category-tag[data-category="community"]   { background: #fbbf2422; color: var(--pin-community); }
.category-tag[data-category="science"]     { background: #a78bfa22; color: var(--pin-science); }
.category-tag[data-category="other"]       { background: #94a3b822; color: var(--pin-other); }
```

## Naming Conventions

- **Files:** kebab-case (`story-card.tsx`, `fetch-rss.ts`, `process-stories.ts`)
- **React components:** PascalCase (`StoryCard`, `StoryPanel`, `Map`)
- **Functions/variables:** camelCase (`fetchAllFeeds`, `processArticle`, `storyCount`)
- **Constants/env vars:** UPPER_SNAKE_CASE (`ANTHROPIC_API_KEY`, `SUPABASE_URL`)
- **CSS classes:** kebab-case (`.story-card`, `.pin-dot`, `.panel-header`)
- **TypeScript interfaces:** PascalCase (`Story`, `CountryPin`, `RssSource`)
