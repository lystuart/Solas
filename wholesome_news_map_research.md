# Wholesome News — Interactive Positive News Map
## Deep Research Report | May 2026

---

## 1. Map Library Comparison Table

Your goal is a dark, styled, interactive world map with clickable pins for news stories. Here's the real breakdown:

| Library | Best For | Ease of Use | Customizability | License | Cost / Tiles | Verdict |
|---|---|---|---|---|---|---|
| **Leaflet.js** | Simple raster tile maps, low-complexity | ⭐⭐⭐⭐⭐ Very easy | Medium — CSS classes, plugins | BSD 2-Clause (free) | Free with OSM tiles | Good starting point but dated feel |
| **MapLibre GL JS** | Modern vector maps, WebGL, dark themes | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Full style control | BSD 2-Clause (free) | Free with OpenFreeMap tiles | **Best choice for this project** |
| **D3.js (geo module)** | Data viz choropleth maps, custom projections | ⭐⭐ Hard | ⭐⭐⭐⭐⭐ Total control | ISC (free) | N/A — no tiles | Best for flat SVG world maps, no pan/zoom |
| **deck.gl** | Millions of data points, 3D, heatmaps | ⭐⭐ Hard | ⭐⭐⭐⭐ Very high | MIT (free) | Needs a base map underneath | Overkill for MVP |
| **Mapbox GL JS** | Same as MapLibre but proprietary | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Full | Proprietary (v2+) | $5/1000 map loads after 50k/mo | Hidden costs at scale — avoid |

### Winner: MapLibre GL JS + OpenFreeMap tiles

**Why:** MapLibre is the open-source fork of Mapbox GL JS — same WebGL rendering, same smooth zooming, same rich style control. Pair it with **OpenFreeMap** (unlimited free vector tiles, no API key needed) and you have a fully free, gorgeous, dark-themeable map stack. You can customize every colour, every label font, every road weight — which is exactly what you need for the dark navy aesthetic.

**Tile providers ranked for free tier:**

| Provider | Free Tier | API Key Needed | Notes |
|---|---|---|---|
| **OpenFreeMap** | Unlimited | No | Part of OSM ecosystem, MapLibre-native |
| **MapTiler** | 100k tile loads/mo | Yes | Best-looking styles, easy dark mode |
| **Stadia Maps** | Generous, credit-based | Yes | Hosts the Stamen Toner styles (minimalist black & white) |
| **Geoapify** | 3,000 credits/day | Yes | Fine for low traffic |

**Recommendation for MVP:** Start with OpenFreeMap (zero cost, zero API key). If you want a polished dark style fast, sign up for MapTiler's free tier and use their `dataviz-dark` or `streets-v2` style. 100k tile loads/month handles moderate traffic easily.

---

## 2. Global Positive News Sources

### Core Positive News Sources (RSS feeds confirmed)

| Source | URL | Feed Type | Region Coverage | Update Freq | Notes |
|---|---|---|---|---|---|
| **Good News Network** | goodnewsnetwork.org | RSS: `/feed` | Global, US-heavy | Daily, 5–10 stories | Since 1997, high domain authority (82), well-established |
| **Positive News UK** | positive.news | RSS: `/feed` | Global, UK-framed | Weekly/ongoing | Magazine-quality writing, global community |
| **Upworthy** | upworthy.com | RSS: `/feed` | US + Global | Daily | 10M+ Facebook followers, mainstream reach |
| **Yes! Magazine** | yesmagazine.org | RSS: `/feed` | US, some global | Multiple/week | Solutions journalism, good depth |
| **Jane Goodall's Good for All News** | news.janegoodall.org | RSS: `/feed` | Global conservation | Weekly | Environment/science niche |

### Regional Coverage — the real problem to solve

Most positive news sources are English-language and heavily US/UK. Here's your underrepresented region playbook:

**Africa**

| Source | URL | Feed | Region | Notes |
|---|---|---|---|---|
| **Africanews** | africanews.com | RSS: `/feed/rss` | All Africa | TV + digital, pan-African |
| **How We Made It in Africa** | howwemadeitinafrica.com | RSS: `/feed` | Sub-Saharan business | Entrepreneur stories — positive by nature |
| **Africa.com** | africa.com | RSS: `/feed` | Pan-African | Culture, tech, biz |
| **AllAfrica** | allafrica.com | Scrapeable / RSS | 55 countries | Massive aggregator, filter for positive |
| **VOA Africa** | voanews.com | RSS | Sub-Saharan + North Africa | English-language, US gov funded |

**South America**

| Source | URL | Feed | Region | Notes |
|---|---|---|---|---|
| **Global Voices — Latin America** | globalvoices.org/feeds/lang/es | RSS by region | All of LatAm | Community journalism, multilingual |
| **Agencia EFE** | efe.com | RSS available | Spanish-speaking world | Major wire service, scrapeable |
| **Merco Press** | mercopress.com | RSS: `/feed` | Southern Cone (Argentina, Uruguay, Brazil) | English-language LatAm coverage |
| **Brasil de Fato** | brasildefato.com.br | RSS | Brazil | Left-leaning but progressive/solutions-focused |

**Asia**

| Source | URL | Feed | Region | Notes |
|---|---|---|---|---|
| **Global Voices — East/SE/South Asia** | globalvoices.org | RSS by region | Broad Asia coverage | Volunteer citizen journalism |
| **NDTV World** | ndtv.com | RSS: feedburner world news URL | India + global | High-traffic Indian source |
| **Channel NewsAsia** | channelnewsasia.com | RSS: `/rss/news/world` | Southeast Asia | Singapore-based, English |
| **Japan Times** | japantimes.co.jp | RSS | Japan + East Asia | English-language |
| **The Hindu** | thehindu.com | RSS | South Asia | Quality Indian journalism |

**Middle East**

| Source | URL | Feed | Region | Notes |
|---|---|---|---|---|
| **UN News — Middle East** | news.un.org | RSS: `/en/rss-feeds` | Broad Middle East | UN humanitarian/development angle |
| **Al-Monitor** | al-monitor.com | RSS | Middle East focus | Analysis-heavy, progress stories exist |
| **Arab News** | arabnews.com | RSS | Saudi Arabia + region | English-language, modernization coverage |

**Cross-region positive-only aggregators**

| Source | Notes |
|---|---|
| **r/UpliftingNews** | Reddit — no official API (use pushshift or scrape), very active, global scope |
| **Global Voices** | Extraordinary resource — RSS by region AND topic, volunteer-written, underrepresented countries specifically |
| **UN News RSS** | Broken into Africa, Asia Pacific, Americas, Middle East, Europe — development/humanitarian angle, genuinely positive framing |

### Hidden problem: most "positive" sources are Western

Your real strategy should be: pull from **global general news sources** (Africanews, Global Voices, VOA by region, NDTV, etc.) and **filter for positive sentiment** using Claude. This gives you actual global coverage instead of relying on positive-news-only sources that are almost entirely American/British.

---

## 3. AI Pipeline Architecture

### The full pipeline, step by step

```
[Cron Job — every 6 hours]
         |
         v
[RSS Fetch Layer]
  - Pull 10–15 RSS feeds via Node/Python
  - Parse XML with fast-xml-parser or feedparser
  - Deduplicate by URL + title hash
  - Store raw articles in DB (status: "pending")
         |
         v
[Claude Haiku 4.5 — Filter + Geo-tag + Summarize]
  For each pending article, send ONE API call with:
  - Article title + first 500 words
  - System prompt: "Is this positive/uplifting? (yes/no)
    If yes, extract: country name, lat/lng, 2-sentence summary,
    category (science/environment/health/community/etc)"
  - Output as JSON
         |
         v
[Store in Supabase]
  Table: stories
  - id, title, url, source, country, lat, lng, 
    summary, category, sentiment_score, created_at
         |
         v
[Frontend — MapLibre GL]
  - Fetch today's stories via Supabase REST API
  - Render as animated pins on world map
  - Click pin → slide-in card with summary + link
```

### Which Claude model?

**Use Claude Haiku 4.5 for this pipeline.** Here's why:

- Pricing: $1.00 input / $5.00 output per million tokens
- A typical article title + 500 words ≈ ~700 input tokens, ~150 output tokens
- Cost per article: roughly **$0.00145** (≈ $0.15 per 100 articles processed)
- If you process 200 articles/day → ~$0.29/day → **~$8.70/month**
- Haiku is fast (lower latency than Sonnet), which matters for scheduled batch jobs
- Quality for classification + geo-extraction + short summaries is 98%+ on Haiku — you don't need Sonnet for this

**Use the Batch API** for an additional 50% discount → brings you to ~$4–5/month for the AI layer.

One prompt does all three tasks (filter + geo-tag + summarize), saving you API calls.

### Location extraction — the reliable way

The simplest and most reliable approach for MVP:

```json
{
  "role": "user", 
  "content": "Article: [title + first 500 words]\n\nRespond ONLY with JSON: {\"is_positive\": true/false, \"country\": \"Nigeria\", \"country_code\": \"NG\", \"lat\": 9.0820, \"lng\": 8.6753, \"summary\": \"2-sentence plain English summary\", \"category\": \"health\"}\n\nIf no clear country, use null for geo fields."
}
```

Claude Haiku handles this with high accuracy. For fallback, use **OpenStreetMap Nominatim API** (free geocoding) — take the extracted country name and hit `https://nominatim.openstreetmap.org/search?q=Nigeria&format=json` to get precise coordinates.

### Cheapest cron job setup

| Option | Cost | Notes |
|---|---|---|
| **Vercel Cron (free tier)** | Free | Up to 2 cron jobs/project, 12x/day max. Works for every-6-hour RSS pulls |
| **GitHub Actions scheduled** | Free (2000 min/mo) | `on: schedule: - cron: '0 */6 * * *'` — run a Node script, push results to Supabase |
| **Supabase Edge Functions + pg_cron** | Free tier included | Schedule directly in your DB layer |
| **Railway cron** | ~$1/mo usage | Most flexible but costs money |

**Best for MVP:** GitHub Actions on a schedule. Free, version-controlled, easy to debug. Your friend with coding skills will know this workflow.

---

## 4. Tech Stack Recommendation

### Frontend

**Use Next.js** — here's the plain-English reasoning:

- Your friend likely knows React. Next.js is React with routing and API routes baked in
- Vercel (Next.js's creator) deploys it in one click from GitHub
- API routes mean you can write your backend logic (RSS fetching, Claude calls) in the same repo
- SvelteKit is faster to write but smaller ecosystem, fewer StackOverflow answers when stuck at 1am during a 2-week sprint
- Plain HTML/JS works but you'll end up rebuilding React manually — not worth it

### Backend/API

**Vercel Serverless Functions (API routes in Next.js)** — no separate backend needed for MVP. Each API route (`/api/stories`, `/api/fetch-rss`) is a serverless function that auto-deploys.

**Watch out:** Vercel serverless functions timeout at 10 seconds on free tier, 60 seconds on Pro. RSS fetching + Claude calls might push this. Workaround: use GitHub Actions to run the pipeline and just store results in Supabase. Your Next.js app only reads from Supabase — no compute-heavy endpoint needed.

### Hosting

| Platform | Free Tier | Best For | Hidden Costs |
|---|---|---|---|
| **Vercel** | 100GB bandwidth, unlimited static, serverless functions | Next.js frontend | Functions timeout at 10s on free; no native DB |
| **Netlify** | 100GB bandwidth, 125k function invocations/mo | Static + JAMstack | Similar timeout issues, no DB |
| **Render** | Free static sites, free web service (sleeps after inactivity) | Full-stack if you need always-on | 30–60s cold start on free tier |
| **Railway** | ~$1 credit/mo | Full backend control | Credit runs out fast on free |

**Recommendation:** Frontend on **Vercel** (zero config, instant deploy, perfect for Next.js). Pipeline cron on **GitHub Actions** (free). Database on **Supabase** (free).

### Database

**Use Supabase** — no debate here.

- Free tier: 500 MB PostgreSQL, 50k MAUs, unlimited API requests
- 500 MB holds 2–5 million rows — you'd need years to fill this at 200 stories/day
- Auto-generated REST API means your frontend fetches stories with zero backend code
- One critical warning: **free projects pause after 7 days of inactivity** — you need at least one request every week or Supabase will put your DB to sleep. Set up a weekly GitHub Action ping or use Supabase's "Pro pause prevention" workaround

**Alternative if you want zero complexity:** A flat JSON file in a GitHub repo, updated by your cron job. Read directly from raw.githubusercontent.com. Zero database setup, zero cost. Works fine for MVP with low traffic.

### Full Stack Summary

```
Next.js (React) → Vercel (hosting)
      ↓
Supabase (PostgreSQL DB) ← GitHub Actions (cron pipeline)
      ↑                              ↓
 MapLibre GL JS          Claude Haiku 4.5 (filter/geo/summarize)
 OpenFreeMap tiles       RSS feeds (15 sources)
```

---

## 5. Competitor Analysis

### Good News Network (goodnewsnetwork.org)
**What works:** Huge brand authority (since 1997), highly shareable stories, clean layout. Domain authority 82 — extremely strong SEO.  
**What sucks:** No map. Just a blog feed. Zero geographic context. Stories are US-centric. Desktop feels dated. No categorization by location.  
**Your edge:** A map gives instant "where in the world" context that GNN completely lacks.

### Goodable (goodable.co)
**What works:** Excellent app design. ML-powered positive filtering. "Happiness Score" per article. Partnership with Yahoo News gives massive distribution. Categorized by topic (Climate, Tech, Animals, etc.). Toronto-based (useful for grants/PR angle).  
**What sucks:** App-only, no web map. No geographic visualization. Paywalled premium features (Goodable Spark). Heavy wellness angle may alienate users who just want news.  
**Your edge:** Web-first with geographic discovery. Free with no wellness paywall.

### Lapis News
**What works:** Beautifully simple. Swipe-to-read mechanic (like Tinder for good news). Adds 4–8 stories/day. Cute animals tab. Jokes tab.  
**What sucks:** No geographic discovery. Minimal regional coverage. Very sparse — 4–8 stories/day isn't much. App-only.  
**Your edge:** Web accessible. Global map. Volume — pulling 15 RSS feeds gives you 50–100+ stories/day.

### NewsMap (newsmap.ijmacd.com)
**What works:** Beautiful treemap visualization of Google News. Shows scale/volume of coverage. Regional editions available.  
**What sucks:** Only negative news (Google News). Treemap is hard to parse. No geographic coordinates — countries, not pins. Technically complex for a niche audience.  
**Your edge:** Actual geographic pins, positive-only filter, human-readable summaries, better mobile UX.

### Key gap none of them fill
**No one has built a beautiful, web-accessible, interactive world map of positive news with real geographic pin placement and global coverage.** That's the gap. Your unique value prop: *"See where good things are happening, right now, on a map."*

---

## 6. Design & UI Guidance

### The dark navy map aesthetic — how to actually implement it

**MapLibre dark style setup:**
```javascript
// Use MapTiler's dataviz dark style (free tier)
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=YOUR_KEY',
  center: [0, 20],
  zoom: 2,
  projection: 'globe' // 3D globe option if you want drama
});
```

Or use a custom MapLibre style JSON file with:
- Background: `#0a0f1e` (deep navy)
- Water: `#0d1b2a` (slightly lighter navy)
- Land: `#131c2e`
- Country borders: `#1e3a5f` (muted blue-grey)
- Labels: `#4a7fa5` (soft blue)

### Typography that doesn't scream "shadcn default"

Avoid Inter, Roboto, system fonts. Instead:

| Use Case | Font | Why |
|---|---|---|
| Headlines/Logo | **Playfair Display** or **Cormorant Garamond** | Elegant editorial feel, newspaper DNA |
| Body/Cards | **DM Sans** or **Sora** | Clean but distinctive, not Inter |
| Category labels | **Space Mono** or **DM Mono** | Monospace adds a data/tech edge |
| Country names on map | **Libre Franklin** or **Barlow** | Wide, clear at small sizes |

All free on Google Fonts. Load 2 max — one display, one body.

### CSS animation for card slide-ins

```css
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.news-card {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Stagger multiple cards */
.news-card:nth-child(1) { animation-delay: 0ms; }
.news-card:nth-child(2) { animation-delay: 50ms; }
.news-card:nth-child(3) { animation-delay: 100ms; }
```

Use `cubic-bezier(0.16, 1, 0.3, 1)` — this is the "spring" easing that makes animations feel premium vs the generic `ease-in-out`.

### Pin design for map markers

Don't use the default Leaflet/MapLibre pins. Build custom ones:

```javascript
// Custom pulsing pin
const el = document.createElement('div');
el.className = 'news-pin';
el.innerHTML = `
  <div class="pin-dot"></div>
  <div class="pin-pulse"></div>
`;
```

```css
.news-pin { position: relative; width: 16px; height: 16px; }
.pin-dot {
  width: 10px; height: 10px;
  background: #4ade80; /* green for positive */
  border-radius: 50%;
  position: absolute; top: 3px; left: 3px;
  box-shadow: 0 0 8px #4ade80;
}
.pin-pulse {
  width: 16px; height: 16px;
  background: rgba(74, 222, 128, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}
```

Color-code pins by category: green = environment, blue = health, yellow = community, etc.

### Other premium touches
- **Subtle noise texture overlay** on the map: `background: url("noise.svg")` at 3% opacity — breaks up flat color and adds depth
- **Glassmorphism card panel:** `background: rgba(10, 15, 30, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08);`
- **Gradient title text:** `background: linear-gradient(135deg, #7dd3fc, #a5f3fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`

---

## 7. MVP Development Roadmap

### Week 1 — Infrastructure + Pipeline

**Day 1–2: Setup**
- Create Next.js app (`npx create-next-app wholesome-news`)
- Set up Supabase project — create `stories` table with columns: `id, title, url, source, country, lat, lng, summary, category, published_at`
- Install MapLibre GL JS: `npm install maplibre-gl`
- Set up Vercel deployment (connect GitHub repo, auto-deploys on push)

**Day 3–4: RSS Pipeline**
- Write RSS fetcher in Node.js (use `rss-parser` npm package)
- Start with 5 sources: Good News Network, Positive News UK, Global Voices, Africanews, VOA
- Test raw article output — see what you're working with

**Day 5–6: Claude Integration**
- Write the Haiku prompt (filter + geo + summarize in one call)
- Test on 20 articles manually, tune the prompt until geo accuracy is >90%
- Set up GitHub Actions workflow to run every 6 hours, push results to Supabase

**Day 7: Basic Map**
- Render MapLibre map with dark style
- Fetch stories from Supabase, drop basic pins
- Make sure the pipeline → DB → map loop is working end to end

### Week 2 — Polish + Launch

**Day 8–9: UI/Cards**
- Design news card panel (slide-in on pin click)
- Implement category color-coding for pins
- Add pulsing pin animation
- Typography: load Playfair Display + DM Sans from Google Fonts

**Day 10–11: UX Features**
- Filter by category (buttons at top of page)
- "Today" vs "This Week" toggle
- Mobile responsiveness (MapLibre works on mobile natively)
- Loading states while map renders

**Day 12: More Sources**
- Add 5–10 more RSS feeds, especially regional ones
- Re-run pipeline, check geographic distribution on map

**Day 13: QA + Polish**
- Test on mobile, tablet, desktop
- Fix any Claude geo-tagging errors (build a simple "report wrong location" button for future)
- Add site metadata, OG image for sharing

**Day 14: Launch**
- Post to Reddit (r/webdev, r/InternetIsBeautiful, r/UpliftingNews)
- Share link in your network
- Observe what's broken in production

---

## 8. Budget Breakdown

### Free Tier (Target: $0/month for MVP)

| Service | What You're Using | Free Limit | Monthly Cost |
|---|---|---|---|
| **Vercel** | Next.js hosting + serverless | 100GB bandwidth, unlimited deployments | $0 |
| **Supabase** | PostgreSQL DB + REST API | 500MB storage, unlimited API | $0 |
| **GitHub Actions** | Cron job (RSS fetch + Claude calls) | 2,000 minutes/month | $0 |
| **OpenFreeMap** | Map tiles | Unlimited | $0 |
| **MapTiler** (optional) | Better-looking dark tiles | 100k tile loads/month | $0 |
| **RSS Feeds** | News data | Free to fetch | $0 |
| **Claude Haiku 4.5** | Filter + geo + summarize | Pay per use | ~$4–9/month |
| **Nominatim (OSM)** | Fallback geocoding | Free, rate-limited | $0 |

### Real Cost: Claude API only

Processing 150 articles/day:
- Input: 150 × 700 tokens = 105,000 tokens/day → ~3.15M/month → $3.15 input
- Output: 150 × 150 tokens = 22,500 tokens/day → ~675K/month → $3.38 output
- **Total: ~$6.50/month before batch discount**
- **With Batch API (50% off): ~$3.25/month**

Processing 300 articles/day (15 active RSS feeds):
- **~$6.50/month with batch discount**

### If traffic grows (paid tier estimates)

| Trigger | Upgrade | Cost |
|---|---|---|
| >100k map tile loads/month | MapTiler paid | $25/month |
| Supabase DB nearing 500MB | Supabase Pro | $25/month |
| Need always-on backend | Render paid | $7/month |
| Vercel bandwidth exceeded | Vercel Pro | $20/month |

### Total honest estimate
- **MVP (Week 1–2):** ~$3–7/month (Claude API only)
- **After validation, light traffic:** ~$3–7/month
- **After validation, growing traffic:** ~$50–60/month
- **Before you need to charge users:** Free for a very long time

### Hidden cost flags ⚠️
1. **Supabase 7-day inactivity pause** — set up a weekly ping or your DB goes to sleep
2. **Vercel 10-second function timeout** — don't put your Claude pipeline in a Vercel function; use GitHub Actions instead
3. **Railway "$1 credit" free tier** — burns through fast if anything is running 24/7; avoid for this project
4. **RSS feeds without attribution** — some sites block scrapers. Always credit sources and don't exceed 1 request/minute per domain
5. **Claude Batch API delay** — batch responses come back within 24 hours, not instantly. For a news app refreshing every 6 hours, use standard API (not batch). Batch only makes sense for historical backfills

---

## Summary Recommendation

**Ship in 2 weeks, keep it simple:**

1. **MapLibre GL JS + OpenFreeMap/MapTiler** — dark, beautiful, totally free
2. **Next.js on Vercel** — fastest to deploy, zero config
3. **GitHub Actions cron** — free scheduled pipeline, no server needed
4. **Claude Haiku 4.5** — ~$6/month for 300 articles/day, one prompt does filter + geo + summarize
5. **Supabase** — free PostgreSQL, auto-REST API, zero backend code
6. **Start with 5 RSS feeds** (Good News Network, Positive News UK, Global Voices, Africanews, VOA) — expand once the pipeline works
7. **Use Global Voices + VOA regional feeds** to solve the underrepresented region problem — don't rely on positive-only sources for global coverage, filter general sources instead
