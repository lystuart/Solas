# Technical Design Document: Wholesome News MVP

## How We'll Build It

### Recommended Approach: Next.js + Supabase + GitHub Actions + Claude Haiku

Based on the PRD requirements, 2-week timeline, and free-tier budget, here's the full stack:

**Primary Stack:**
- **Frontend:** Next.js (React framework) deployed on Vercel
- **Map:** MapLibre GL JS + OpenFreeMap tiles (or MapTiler free tier)
- **Database:** Supabase (free PostgreSQL + auto-generated REST API)
- **Pipeline:** GitHub Actions cron job (runs every 6 hours, free)
- **AI:** Claude Haiku 4.5 (filter + geo-tag + summarize in one call)

**Why this stack:**
- Everything except Claude API is free — total cost ~$3–7/month
- Next.js deploys instantly to Vercel with one GitHub push
- Supabase auto-generates a REST API, so the map fetches stories with zero backend code
- GitHub Actions runs the pipeline on a schedule for free — no server needed
- Claude Haiku is fast, cheap (~$0.0015/article), and accurate for this use case

### Alternative Options Compared

| Option | Pros | Cons | Cost | Time to MVP |
|--------|------|------|------|-------------|
| **Next.js + Supabase** (recommended) | Free, fast deploy, great DX, AI knows it well | Slight learning curve | ~$3–7/mo | 2 weeks |
| Plain HTML + JSON file | Simplest possible, zero DB needed | Hard to scale, no auto-API, manual updates | $0 | 1 week |
| SvelteKit + PlanetScale | Faster to write, elegant syntax | Smaller ecosystem, less AI training data | ~$5/mo | 2–3 weeks |
| No-code (Webflow + Airtable) | No coding required | Map interactivity very limited, can't do custom pins or Claude pipeline | $30–50/mo | 1–2 weeks |

**Trade-off acknowledged:** Plain HTML + a flat JSON file is genuinely viable for an early MVP (zero DB setup, just fetch a JSON file from GitHub). If Week 1 is moving too slowly, fall back to this approach for a first working version, then migrate to Supabase once the pipeline is proven.

---

## Project Setup Checklist

### Step 1: Create Accounts (Day 1)
- [ ] **GitHub** — github.com (free) — stores your code + runs the pipeline
- [ ] **Vercel** — vercel.com (free) — hosts your website, auto-deploys on git push
- [ ] **Supabase** — supabase.com (free) — your database
- [ ] **Anthropic API** — console.anthropic.com — for Claude Haiku (add ~$10 credit to start)
- [ ] **MapTiler** — maptiler.com (free tier) — for the dark map style (optional but better looking than OpenFreeMap)

### Step 2: AI Assistant Setup (Day 1)
- [ ] Install **Cursor** (cursor.com) — AI-powered code editor, best tool for this build
- [ ] Or use **Claude Code** (CLI) if you prefer terminal-based
- [ ] Both tools let you describe what you want and get working code
- [ ] Test with: "Create a Next.js page that shows Hello World in a dark navy background"

### Step 3: Project Initialization (Day 2)

```bash
# Create the project
npx create-next-app@latest wholesome-news --typescript --tailwind --app

# Move into it
cd wholesome-news

# Install the key libraries
npm install maplibre-gl @supabase/supabase-js rss-parser fast-xml-parser @anthropic-ai/sdk

# Run it locally
npm run dev
```

Open `http://localhost:3000` — you should see the Next.js default page.

---

## Project File Structure

```
wholesome-news/
├── app/
│   ├── page.tsx              # Main map page (home screen)
│   ├── layout.tsx            # Root layout — loads fonts, global styles
│   └── globals.css           # CSS variables, global resets
├── components/
│   ├── Map.tsx               # MapLibre GL JS wrapper
│   ├── StoryPanel.tsx        # Country card overlay (slide-up panel)
│   ├── StoryCard.tsx         # Individual story card
│   └── CategoryFilter.tsx    # Filter buttons (nice-to-have)
├── lib/
│   ├── supabase.ts           # Supabase client (read-only for frontend)
│   └── types.ts              # TypeScript types for Story, Category, etc.
├── pipeline/
│   ├── sources.ts            # List of RSS feed URLs
│   ├── fetch-rss.ts          # Fetches and parses RSS feeds
│   ├── process-stories.ts    # Sends articles to Claude Haiku
│   └── run.ts                # Entry point — orchestrates the pipeline
└── .github/
    └── workflows/
        └── pipeline.yml      # GitHub Actions cron schedule
```

---

## Building Your Features

### Feature 1: Interactive World Map with Category Pins

**Complexity:** Medium (MapLibre has a learning curve, but the code below gets you started)

#### Implementation

**Install MapLibre CSS in `app/layout.tsx`:**
```typescript
import 'maplibre-gl/dist/maplibre-gl.css'
```

**Create `components/Map.tsx`:**
```typescript
'use client'
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

const CATEGORY_COLORS: Record<string, string> = {
  environment: '#4ade80',  // green
  health: '#60a5fa',       // blue
  community: '#fbbf24',    // yellow
  science: '#a78bfa',      // purple
  other: '#94a3b8',        // grey
}

export default function Map({ stories, onCountryClick }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Option A: MapTiler dark style (free tier, looks great)
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      // Option B: OpenFreeMap (zero API key needed)
      // style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [10, 20],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 8,
    })

    map.current.on('load', () => {
      addPinsToMap(stories)
    })
  }, [])

  function addPinsToMap(stories) {
    // Group stories by country
    const byCountry = {}
    stories.forEach(story => {
      if (!story.lat || !story.lng) return
      const key = story.country_code
      if (!byCountry[key]) byCountry[key] = { ...story, count: 0 }
      byCountry[key].count++
    })

    // Add a custom pulsing pin for each country
    Object.values(byCountry).forEach(country => {
      const el = createPinElement(country)
      new maplibregl.Marker({ element: el })
        .setLngLat([country.lng, country.lat])
        .addTo(map.current)

      el.addEventListener('click', () => onCountryClick(country.country_code))
    })
  }

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100vh' }}
    />
  )
}

function createPinElement(country) {
  const color = CATEGORY_COLORS[country.category] || CATEGORY_COLORS.other
  const el = document.createElement('div')
  el.className = 'news-pin'
  el.innerHTML = `
    <div class="pin-dot" style="background: ${color}; box-shadow: 0 0 8px ${color}"></div>
    <div class="pin-pulse" style="background: ${color}33"></div>
  `
  return el
}
```

**Add pin styles to `app/globals.css`:**
```css
:root {
  --navy-bg: #0a0f1e;
  --navy-water: #0d1b2a;
  --navy-land: #131c2e;
  --navy-border: #1e3a5f;
  --text-primary: #e2e8f0;
  --text-muted: #64748b;
}

body {
  background: var(--navy-bg);
  color: var(--text-primary);
  margin: 0;
}

/* Custom map pins */
.news-pin {
  position: relative;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.pin-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  z-index: 2;
}

.pin-pulse {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.8); opacity: 0; }
}
```

**Test by:** Opening localhost:3000, verifying the dark map renders and at least one test pin is visible and clickable.

---

### Feature 2: Country Story Card Overlay

**Complexity:** Easy (standard React component + CSS animation)

#### Implementation

**Create `components/StoryCard.tsx`:**
```typescript
interface Story {
  id: string
  title: string
  summary: string
  category: string
  source: string
  url: string
  published_at: string
}

export function StoryCard({ story }: { story: Story }) {
  return (
    <div className="story-card">
      <a href={story.url} target="_blank" rel="noopener noreferrer">
        <h3 className="story-title">{story.title}</h3>
      </a>
      <p className="story-summary">{story.summary}</p>
      <div className="story-footer">
        <span className={`category-tag category-${story.category}`}>
          {story.category}
        </span>
        <span className="story-source">
          {story.source} ↗
        </span>
      </div>
    </div>
  )
}
```

**Create `components/StoryPanel.tsx`:**
```typescript
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StoryCard } from './StoryCard'

export function StoryPanel({ countryCode, countryName, onClose }) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStories() {
      setLoading(true)
      const { data } = await supabase
        .from('stories')
        .select('*')
        .eq('country_code', countryCode)
        .order('published_at', { ascending: false })
        .limit(20)
      setStories(data || [])
      setLoading(false)
    }
    fetchStories()
  }, [countryCode])

  return (
    <div className="story-panel">
      <div className="panel-header">
        <h2>{countryName}</h2>
        <button onClick={onClose} className="close-btn" aria-label="Close">✕</button>
      </div>
      <div className="panel-body">
        {loading && <p className="loading-text">Loading stories...</p>}
        {stories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  )
}
```

**Panel CSS in `globals.css`:**
```css
/* Story Panel */
.story-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  background: rgba(10, 15, 30, 0.92);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px 16px 0 0;
  z-index: 100;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  padding: 20px;
}

/* Desktop: side panel instead of bottom sheet */
@media (min-width: 768px) {
  .story-panel {
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    width: 380px;
    max-height: 100vh;
    border-radius: 0;
    border-top: none;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes slideRight {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}

/* Story Cards */
.story-card {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  animation: fadeIn 0.3s ease forwards;
}

.story-title {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 8px;
  line-height: 1.4;
  text-decoration: none;
}

.story-title:hover { color: #7dd3fc; }

.story-summary {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 10px;
  line-height: 1.5;
}

.story-footer {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 0.75rem;
}

.category-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
}

.category-environment { background: #4ade8022; color: #4ade80; }
.category-health      { background: #60a5fa22; color: #60a5fa; }
.category-community   { background: #fbbf2422; color: #fbbf24; }
.category-science     { background: #a78bfa22; color: #a78bfa; }
.category-other       { background: #94a3b822; color: #94a3b8; }

.story-source { color: var(--text-muted); }
```

**Test by:** Clicking a pin on the map, verifying the panel slides in with the spring animation, stories load and display correctly, X button closes it, and links open in a new tab.

---

### Feature 3: Automated AI Content Pipeline

**Complexity:** Medium (most complex feature — build this in Week 1 so you have time to tune it)

#### Database Setup (Supabase)

Go to supabase.com → New project → SQL Editor. Run this:

```sql
CREATE TABLE stories (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  url           TEXT        NOT NULL,
  url_hash      TEXT        UNIQUE NOT NULL,  -- for deduplication
  source        TEXT        NOT NULL,
  country       TEXT,
  country_code  CHAR(2),
  lat           DECIMAL(9,6),
  lng           DECIMAL(10,6),
  summary       TEXT,
  category      TEXT        CHECK (category IN ('environment','health','community','science','other')),
  published_at  TIMESTAMPTZ,
  processed_at  TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast map queries
CREATE INDEX idx_stories_country   ON stories(country_code);
CREATE INDEX idx_stories_category  ON stories(category);
CREATE INDEX idx_stories_published ON stories(published_at DESC);

-- Allow public read-only access (no auth needed for the map)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON stories FOR SELECT USING (true);
```

This table holds ~500 bytes/row. At 200 stories/day, you'll hit 500MB (the free limit) in **~7 years**.

#### RSS Sources List — `pipeline/sources.ts`

```typescript
export const RSS_SOURCES = [
  // Positive-only sources
  { url: 'https://www.goodnewsnetwork.org/feed/', name: 'Good News Network', region: 'global' },
  { url: 'https://positive.news/feed/', name: 'Positive News', region: 'global' },
  { url: 'https://www.upworthy.com/feed', name: 'Upworthy', region: 'global' },
  { url: 'https://news.janegoodall.org/feed/', name: 'Jane Goodall News', region: 'global' },

  // Global coverage — filtered for positive by Claude
  { url: 'https://globalvoices.org/feed/', name: 'Global Voices', region: 'global' },
  { url: 'https://www.africanews.com/feed/rss', name: 'Africanews', region: 'africa' },
  { url: 'https://howwemadeitinafrica.com/feed/', name: 'How We Made It in Africa', region: 'africa' },
  { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', name: 'AllAfrica', region: 'africa' },
  { url: 'https://mercopress.com/rss', name: 'MercoPress', region: 'south-america' },
  { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', name: 'Channel NewsAsia', region: 'asia' },
  { url: 'https://feeds.feedburner.com/ndtvnews-world-news', name: 'NDTV World', region: 'asia' },
  { url: 'https://www.thehindu.com/feeder/default.rss', name: 'The Hindu', region: 'asia' },
  { url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', name: 'UN News', region: 'global' },
  { url: 'https://www.arabnews.com/rss.xml', name: 'Arab News', region: 'middle-east' },
]
```

#### RSS Fetcher — `pipeline/fetch-rss.ts`

```typescript
import Parser from 'rss-parser'
import crypto from 'crypto'

const parser = new Parser()

export interface RawArticle {
  title: string
  url: string
  url_hash: string
  source: string
  content: string
  published_at: string
}

export async function fetchAllFeeds(sources: typeof RSS_SOURCES): Promise<RawArticle[]> {
  const articles: RawArticle[] = []

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url)

      for (const item of feed.items.slice(0, 20)) { // max 20 per source
        const url = item.link || ''
        const title = item.title || ''
        if (!url || !title) continue

        articles.push({
          title,
          url,
          url_hash: crypto.createHash('md5').update(url).digest('hex'),
          source: source.name,
          content: item.contentSnippet || item.content || '',
          published_at: item.pubDate || new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error(`Failed to fetch ${source.name}:`, err.message)
      // Don't crash the whole pipeline if one feed fails
    }
  }

  return articles
}
```

#### Claude Haiku Processor — `pipeline/process-stories.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { RawArticle } from './fetch-rss'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are a news classifier. For each article, determine if it is positive/uplifting news.
If yes, extract location and summarize. Always respond with valid JSON only, no other text.`

export async function processArticle(article: RawArticle) {
  const prompt = `Article title: ${article.title}

Article content: ${article.content.slice(0, 800)}

Respond ONLY with this JSON structure (no markdown, no explanation):
{
  "is_positive": true or false,
  "country": "full country name or null",
  "country_code": "ISO 2-letter code or null",
  "lat": latitude as number or null,
  "lng": longitude as number or null,
  "summary": "2-sentence plain English summary or null",
  "category": "one of: environment, health, community, science, other"
}`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    return JSON.parse(text)
  } catch {
    console.error('Failed to parse Claude response:', text)
    return null
  }
}

export async function processAndStore(articles: RawArticle[]) {
  // Get already-processed URLs to skip duplicates
  const { data: existing } = await supabase
    .from('stories')
    .select('url_hash')

  const existingHashes = new Set((existing || []).map(r => r.url_hash))

  let stored = 0
  let skipped = 0

  for (const article of articles) {
    if (existingHashes.has(article.url_hash)) {
      skipped++
      continue
    }

    const result = await processArticle(article)
    if (!result || !result.is_positive || !result.country_code) {
      skipped++
      continue
    }

    await supabase.from('stories').insert({
      title: article.title,
      url: article.url,
      url_hash: article.url_hash,
      source: article.source,
      country: result.country,
      country_code: result.country_code,
      lat: result.lat,
      lng: result.lng,
      summary: result.summary,
      category: result.category,
      published_at: article.published_at,
    })

    stored++
    // Small delay to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`Pipeline complete: ${stored} stored, ${skipped} skipped`)
}
```

#### Pipeline Entry Point — `pipeline/run.ts`

```typescript
import { RSS_SOURCES } from './sources'
import { fetchAllFeeds } from './fetch-rss'
import { processAndStore } from './process-stories'

async function main() {
  console.log('Starting pipeline...')
  const articles = await fetchAllFeeds(RSS_SOURCES)
  console.log(`Fetched ${articles.length} articles`)
  await processAndStore(articles)
}

main().catch(console.error)
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "pipeline": "ts-node pipeline/run.ts"
  }
}
```

#### GitHub Actions Cron — `.github/workflows/pipeline.yml`

```yaml
name: Fetch & Process Stories

on:
  schedule:
    - cron: '0 */6 * * *'   # Every 6 hours
  workflow_dispatch:          # Also runnable manually from GitHub UI

jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run pipeline
        run: npm run pipeline
        env:
          ANTHROPIC_API_KEY:          ${{ secrets.ANTHROPIC_API_KEY }}
          SUPABASE_URL:               ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY:  ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Keep Supabase alive (weekly ping)
        if: github.event.schedule == '0 0 * * 1'
        run: echo "Supabase ping via pipeline run above"
```

**Add secrets in GitHub:** Repository → Settings → Secrets → Actions. Add `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

**Test by:** Clicking "Run workflow" manually from the GitHub Actions tab. Check your Supabase table — stories should appear within a few minutes.

---

## Design Implementation

### Matching Your PRD Vision: "Dark, handcrafted, editorial, premium minimal"

#### Typography Setup — `app/layout.tsx`

```typescript
import { Playfair_Display, DM_Sans, Space_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**Apply in CSS:**
```css
h1, h2, h3, .story-title { font-family: var(--font-display); }
body, p, button          { font-family: var(--font-body); }
.category-tag            { font-family: var(--font-mono); }
```

#### Header Design

Small, non-intrusive — the map is the hero:

```tsx
// In app/page.tsx
<header style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  padding: '12px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(to bottom, rgba(10,15,30,0.9) 0%, transparent 100%)',
  pointerEvents: 'none', // let map clicks pass through
}}>
  <span style={{
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    background: 'linear-gradient(135deg, #7dd3fc, #a5f3fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    pointerEvents: 'all',
  }}>
    ✦ Wholesome News
  </span>
</header>
```

#### Premium Details to Add
- **Noise texture** on the map overlay: adds depth, breaks up flat black
  ```css
  .map-overlay {
    background-image: url("data:image/svg+xml,..."); /* SVG noise */
    opacity: 0.03;
    pointer-events: none;
  }
  ```
- **Staggered card animations:** Each story card fades in 50ms after the previous
  ```css
  .story-card:nth-child(1) { animation-delay: 0ms;   }
  .story-card:nth-child(2) { animation-delay: 50ms;  }
  .story-card:nth-child(3) { animation-delay: 100ms; }
  ```

---

## Supabase Frontend Client — `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// This is the PUBLIC client — read-only, safe to use in the browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Fetch stories for the map (all countries, latest 7 days):**
```typescript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

const { data: stories } = await supabase
  .from('stories')
  .select('id, country, country_code, lat, lng, category')
  .gte('published_at', sevenDaysAgo)
  .not('lat', 'is', null)
```

---

## Environment Variables

Create `.env.local` in the project root (never commit this file):

```bash
# Public (safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-key   # optional, for better dark tiles

# Private (only used by pipeline/server)
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add `.env.local` to `.gitignore` (Next.js does this automatically).

---

## AI Assistance Strategy

### Which AI Tool for What Task

| Task | Best Tool | Example Prompt |
|------|-----------|----------------|
| Writing new components | Cursor | "Create a StoryCard component matching this design spec: [paste CSS vars]" |
| Debugging errors | Claude Code or Cursor | "Error: [paste error]. Current code: [paste code]. Fix and explain." |
| CSS / design questions | Claude | "Make this panel feel more premium — here's the current CSS: [paste]" |
| Claude Haiku prompt tuning | Claude (meta!) | "This prompt isn't extracting locations accurately. Improve it: [paste prompt]" |
| SQL / Supabase queries | Claude | "Write a Supabase query that fetches stories grouped by country for the last 7 days" |
| GitHub Actions config | Claude Code | "Explain why this GitHub Actions YAML isn't triggering on schedule" |
| Reviewing output quality | Manual | Spot-check 20 Claude Haiku outputs — are geo-tags accurate? Are summaries good? |

### Prompting Tips for This Build

**When adding a new component:**
```
I'm building Wholesome News — a dark-themed world map of positive news.
Tech stack: Next.js, TypeScript, MapLibre GL JS, Supabase.
Design: dark navy (#0a0f1e), Playfair Display headlines, DM Sans body.

Task: Create [component name].
Requirements:
- [Requirement from PRD]
- Matches existing dark navy aesthetic
- Uses CSS variables from globals.css
- No external UI libraries except what's already installed

Show the full component code and any new CSS needed.
```

**When the pipeline geo-tags wrong:**
```
My Claude Haiku prompt is misidentifying countries. Example:
- Article: "[paste headline]"
- Got: "[wrong country]"
- Expected: "[correct country]"

Here's my current prompt: [paste]
Fix the prompt to be more accurate for this case.
```

---

## Deployment Plan

### Vercel Setup (Frontend)

1. Push your code to a GitHub repository
2. Go to vercel.com → "Add New Project" → import your GitHub repo
3. Vercel auto-detects Next.js — click Deploy
4. Add environment variables: Vercel dashboard → Settings → Environment Variables
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MAPTILER_KEY` (if using MapTiler)
5. Every git push to `main` auto-deploys in ~60 seconds

### GitHub Actions Setup (Pipeline)

1. Go to your GitHub repo → Settings → Secrets → Actions
2. Add: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Push the `pipeline.yml` workflow file
4. Test it manually: Actions tab → "Fetch & Process Stories" → "Run workflow"

### Backup Hosting Options
- **Netlify:** Identical to Vercel for Next.js — good fallback if Vercel has issues
- **Cloudflare Pages:** Slightly faster edge performance, free tier, slightly more complex Next.js config

---

## Cost Breakdown

> Pricing verified from research as of 2026-04. Always confirm on vendor pricing pages before budgeting.

### Development Phase (Building — Weeks 1-2)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel | Yes — unlimited deploys | vercel.com/pricing |
| Supabase | Yes — 500MB, unlimited API calls | supabase.com/pricing |
| GitHub Actions | Yes — 2,000 min/month | ~20 min/pipeline run × 4/day × 14 days = ~1,120 min |
| OpenFreeMap | Unlimited — no key | tiles.openfreemap.org |
| MapTiler | 100k tile loads/month | maptiler.com/pricing |
| Claude Haiku 4.5 | Pay per use (no free tier) | console.anthropic.com |
| **Development total** | **~$5–10** | One-time Anthropic credit top-up |

### Production Phase (Monthly After Launch)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Free tier more than sufficient for MVP traffic |
| Supabase | $0 | 500MB handles years of stories at 200/day |
| GitHub Actions | $0 | Pipeline uses ~600 min/month, well under 2,000 free |
| Map tiles | $0 | OpenFreeMap unlimited or MapTiler under 100k loads |
| Claude Haiku 4.5 | ~$3–7/month | 150–300 articles/day at standard API rates |
| **Monthly total** | **~$3–7/month** | |

### Scaling Triggers

| Trigger | Action | Estimated Cost |
|---------|--------|----------------|
| >100k map tile loads/month | Upgrade to MapTiler Starter | $25/month |
| Supabase approaching 500MB | Upgrade to Supabase Pro | $25/month |
| >300 articles/day processed | Claude costs scale linearly | +$3–5/month per 150 more articles |
| Vercel bandwidth exceeded | Upgrade to Vercel Pro | $20/month |

---

## Important Limitations

### What This Approach CAN'T Do Well:

1. **Real-time updates without refresh**
   - Stories update every 6 hours, not live
   - *Workaround for MVP:* Fine — news doesn't need to be real-time. Add a "Last updated" timestamp so users know the data age.

2. **Perfect geo-tagging for every story**
   - Claude Haiku will mis-tag ~5-10% of articles (stories about international organizations, multi-country events, etc.)
   - *Workaround:* Stories without a confident country are skipped (`null` check before inserting). Add a "Report wrong location" button in v2.

3. **Reddit scraping (r/UpliftingNews)**
   - Reddit deprecated its old API — scraping is now against ToS without approval
   - *Workaround:* Skip Reddit for MVP. Use the RSS sources listed instead — they're higher quality anyway.

4. **Vercel function timeout on free tier**
   - Vercel functions time out at 10 seconds on the free tier — not long enough to run the full pipeline
   - *Already handled:* Pipeline runs in GitHub Actions, not Vercel. Your Next.js app only reads from Supabase.

5. **Supabase 7-day inactivity pause**
   - Free Supabase projects pause if no requests for 7 days
   - *Workaround:* The GitHub Actions pipeline runs every 6 hours and hits Supabase each time — this prevents the pause automatically.

---

## Week-by-Week Build Plan

### Week 1 — Infrastructure + Pipeline (Days 1–7)

**Day 1–2: Setup**
- [ ] Create all accounts (GitHub, Vercel, Supabase, Anthropic, MapTiler)
- [ ] `npx create-next-app wholesome-news` and push to GitHub
- [ ] Connect GitHub to Vercel — confirm auto-deploy works
- [ ] Create Supabase `stories` table with the SQL schema above

**Day 3–4: RSS Pipeline**
- [ ] Write `pipeline/sources.ts` with 5 starter sources
- [ ] Write `pipeline/fetch-rss.ts` and test locally: `npm run pipeline`
- [ ] Inspect raw article output — check what you're working with
- [ ] Confirm articles are fetching correctly before adding Claude

**Day 5–6: Claude Integration**
- [ ] Write `pipeline/process-stories.ts`
- [ ] Test on 20 articles manually — is geo-tagging accurate?
- [ ] Tune the Claude prompt until accuracy is >90%
- [ ] Run full pipeline and check Supabase table for data

**Day 7: Basic Map**
- [ ] Install and render MapLibre GL JS with dark style
- [ ] Fetch stories from Supabase, drop basic pins on the map
- [ ] Push to GitHub, confirm it deploys to Vercel
- [ ] **Milestone:** Pipeline → DB → Map is working end-to-end

### Week 2 — UI Polish + Launch (Days 8–14)

**Day 8–9: Card Overlay**
- [ ] Build StoryPanel and StoryCard components
- [ ] Implement spring-easing slide-in animation
- [ ] Connect pin clicks to panel open/close
- [ ] Load and display stories per country from Supabase

**Day 10–11: Design Polish**
- [ ] Load Playfair Display + DM Sans + Space Mono from Google Fonts
- [ ] Apply CSS variables for the dark navy palette
- [ ] Custom pulsing pin animation with category colors
- [ ] Header with gradient logo text
- [ ] Mobile responsive layout (side panel → bottom sheet)

**Day 12: More Sources + Coverage Check**
- [ ] Add 5–10 more RSS feeds from the global sources list
- [ ] Re-run pipeline, check geographic distribution on map
- [ ] Are there pins on Africa? South America? Southeast Asia? If not, add more regional sources.

**Day 13: QA**
- [ ] Test on: iPhone Safari, Android Chrome, desktop Chrome, desktop Firefox
- [ ] Test slow connection (Chrome DevTools → Network → Slow 3G)
- [ ] Fix any layout breaks
- [ ] Add OG image and meta description for sharing

**Day 14: Launch**
- [ ] Share with 3-5 friends first — fix anything obviously broken
- [ ] Post to r/InternetIsBeautiful, r/UpliftingNews
- [ ] Watch Vercel Analytics for first real traffic

---

## Success Checklist

### Before Starting Development
- [ ] All accounts created and working
- [ ] Cursor or Claude Code installed and tested
- [ ] `.env.local` file created with all keys
- [ ] Supabase table created and queryable

### During Development
- [ ] Only building features from PRD — nothing extra
- [ ] Testing after each feature before moving on
- [ ] Committing to GitHub after each working feature
- [ ] Asking AI when stuck (describe the problem, paste the error, paste the relevant code)

### Before Launch
- [ ] Pipeline has run successfully at least once automatically via GitHub Actions
- [ ] 20+ countries visible on the map
- [ ] Card overlay works on mobile (tested on real device)
- [ ] All story links open correctly in new tabs
- [ ] No "Lorem ipsum" or placeholder content visible
- [ ] Basic analytics connected (Vercel Analytics is built-in — just enable it)
- [ ] One complete user journey tested end-to-end

## Definition of Technical Success

The implementation is successful when:
- The map loads in < 3 seconds on a standard connection
- The pipeline runs automatically every 6 hours with no manual intervention
- Stories from 20+ countries are visible at any time
- The card overlay slides in smoothly on both mobile and desktop
- Monthly costs stay under $10
- You can update the RSS sources list and redeploy in under 5 minutes

---

*Technical Design for: Wholesome News*
*Approach: Next.js + Supabase + GitHub Actions + Claude Haiku 4.5*
*Estimated Time to MVP: 2 weeks*
*Estimated Monthly Cost: ~$3–7/month*
*Document created: 2026-05-22*
*Status: Ready for Development*
