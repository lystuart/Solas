# Code Patterns

## Architecture Pattern

- **Primary pattern:** Feature-based components with a clear separation between the data pipeline (Node.js scripts in `pipeline/`) and the frontend (Next.js App Router in `app/` and `components/`)
- **Rule:** The frontend only *reads* from Supabase. The pipeline only *writes* to Supabase. They never share runtime.
- **Rule:** No Claude API calls from the frontend. Claude is pipeline-only.
- **Rule:** Keep components small and focused — one responsibility per file.

## Data Fetching

- **Frontend approach:** Supabase REST client (`@supabase/supabase-js`) in React components or Next.js Server Components
- **Server Components (default):** Use for the initial stories fetch that populates pin data (runs on server, no client JS needed)
- **Client Components (`'use client'`):** Required for MapLibre (browser API), StoryPanel (onClick, useState), and any interactive component
- **Pipeline approach:** Direct Supabase Admin client with service role key — reads existing url_hashes to deduplicate, then inserts new stories

```typescript
// Server Component — initial map data fetch (no 'use client' needed)
// app/page.tsx
async function getMapStories() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('stories')
    .select('id, country, country_code, lat, lng, category')
    .gte('published_at', sevenDaysAgo)
    .not('lat', 'is', null)
  if (error) { console.error(error); return [] }
  return data
}

// Client Component — story panel fetch on pin click
// components/StoryPanel.tsx
'use client'
useEffect(() => {
  async function load() {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('country_code', countryCode)
      .order('published_at', { ascending: false })
      .limit(20)
    setStories(data ?? [])
  }
  load()
}, [countryCode])
```

## State Management

- **Server state:** Supabase queries — no external state library needed
- **Client state:** React `useState` + `useEffect` — sufficient for MVP (no Zustand/Redux needed)
- **Map state:** Stored in the MapLibre `map.current` ref — pins are added imperatively via the MapLibre API
- **Rule:** Do not add a state management library for MVP. Built-in React state is sufficient.

```typescript
// Pattern for panel open/close state in page.tsx
const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

// Pass to Map component
<Map onCountryClick={(code) => setSelectedCountry(code)} />

// Show panel when country is selected
{selectedCountry && (
  <StoryPanel
    countryCode={selectedCountry}
    onClose={() => setSelectedCountry(null)}
  />
)}
```

## Error Handling

- Normalize errors at boundaries — never let raw exceptions reach the UI
- Pipeline: catch per-feed errors and continue — don't crash the whole run
- Frontend: show a graceful empty state if Supabase returns no data — never crash

```typescript
// Pipeline pattern — log and continue
for (const source of sources) {
  try {
    const articles = await fetchFeed(source)
    // process...
  } catch (err) {
    console.error(`[pipeline] ${source.name} failed:`, (err as Error).message)
    // continue to next source
  }
}

// Supabase query pattern — always handle error
const { data, error } = await supabase.from('stories').select('*')
if (error) {
  console.error('[supabase]', error.message)
  return []
}

// UI empty state — never crash, show something useful
{stories.length === 0 && !loading && (
  <p className="empty-state">No stories found for this region yet.</p>
)}
```

## Validation

- Claude Haiku output: always parse JSON in a try/catch; skip articles where JSON is malformed
- Skip stories where `country_code` is null — no guessing on location
- Skip stories where `is_positive` is false
- Validate RSS items have both `title` and `link` before processing

```typescript
// Claude response validation
try {
  const result = JSON.parse(claudeResponseText)
  if (!result.is_positive || !result.country_code) return null  // skip
  return result
} catch {
  console.error('[claude] Failed to parse response:', claudeResponseText.slice(0, 100))
  return null
}
```

## MapLibre Patterns

```typescript
// Always check map is loaded before adding pins
map.current.on('load', () => {
  addPinsToMap(stories)
})

// Custom marker element — never use default MapLibre marker
const el = document.createElement('div')
el.className = 'news-pin'
new maplibregl.Marker({ element: el })
  .setLngLat([story.lng, story.lat])
  .addTo(map.current)

// Clean up markers when component unmounts
useEffect(() => {
  return () => { map.current?.remove() }
}, [])
```

## CSS Patterns

```css
/* ALWAYS use CSS variables — never raw hex in component styles */

/* Good */
.pin-dot { background: var(--pin-environment); }

/* Bad */
.pin-dot { background: #4ade80; }

/* Animation — use spring easing for premium feel */
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.story-panel { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

/* Responsive pattern — mobile first */
.story-panel {
  /* Mobile: bottom sheet */
  position: fixed; bottom: 0; left: 0; right: 0;
}
@media (min-width: 768px) {
  /* Desktop: side panel */
  .story-panel { top: 0; right: 0; bottom: 0; left: auto; width: 380px; }
}
```

## File and Naming Conventions

- **Files:** kebab-case — `story-card.tsx`, `fetch-rss.ts`, `process-stories.ts`
- **Components / classes:** PascalCase — `StoryCard`, `StoryPanel`, `Map`
- **Functions / variables:** camelCase — `fetchAllFeeds`, `processArticle`
- **Constants / env vars:** UPPER_SNAKE_CASE — `ANTHROPIC_API_KEY`
- **CSS classes:** kebab-case — `.story-card`, `.pin-dot`, `.panel-header`

## Change Discipline

- One feature at a time — commit after each working feature
- Do not add new npm dependencies without checking if the existing stack already handles the need
- Do not modify `.github/workflows/pipeline.yml` without testing the change in a branch first
- Do not change the Supabase schema without a migration plan (for MVP: drop and recreate table is acceptable since it's all auto-populated data)
- Check `AGENTS.md` active phase before starting any work — do not build Phase 2 features during Phase 1
