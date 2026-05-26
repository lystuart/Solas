import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { RawArticle } from './fetch-rss'
import { COUNTRY_CENTROIDS } from './country-centroids'

interface ClaudeResult {
  is_positive: boolean
  title: string | null
  country: string | null
  country_code: string | null
  summary: string | null
  category: 'environment' | 'community' | 'animals' | 'science' | 'achievement' | 'culture'
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT =
  'You are a heartwarming news filter. Respond ONLY with valid JSON — no markdown, no explanation.'

function buildPrompt(article: RawArticle): string {
  return `Article title: ${article.title}

Article content: ${article.content.slice(0, 800)}

Respond with this exact JSON shape (compact, no extra fields):
{"is_positive":true,"title":"English title of the article","country":"Nigeria","country_code":"NG","summary":"One or two plain English sentences describing the good news.","category":"community"}

ACCEPT — set is_positive:true — ONLY if the story itself is the good news:
- A community built, created, or achieved something together
- An animal or species population recovered, thrived, or was successfully rescued
- A person did something genuinely kind, generous, or remarkable for others
- A country, city, or organisation reached a meaningful positive milestone
- A scientific discovery that is purely good news with no negative framing
- A record broken or first achieved for something joyful or beneficial
- A cultural celebration, tradition, or creative work that brought people joy

REJECT — set is_positive:false — for ANY of the following, even if framed positively:
- Struggle, hardship, challenge, adversity, or difficulty of any kind
- Conflict, war, crime, violence, or political dispute
- Any story whose primary subject involves an active conflict zone or ongoing armed conflict — including Gaza, Palestine, West Bank, Israel (in conflict context), Ukraine (Russia-Ukraine war), Sudan, Yemen, Syria, Myanmar, Afghanistan, Lebanon (Hezbollah conflict) — even if framed positively, nostalgically, as cultural heritage, or as humanitarian aid. The conflict association makes these stories unsuitable regardless of framing. Examples that must be rejected: "Decades-old photos show joyful Gaza", "Ukrainian children find joy", "Aid workers celebrate milestone in Syria".
- Disease, illness, or medical conditions (even breakthrough treatments still center the disease)
- Poverty, hunger, homelessness, or economic hardship
- Endangered, threatened, or declining species (even with conservation efforts underway)
- Environmental damage, pollution, or climate problems (even with a positive response)
- "Despite X, Y happened" — if the context requires knowing about something bad, reject it
- Awareness campaigns or fundraising for problems
- Business news, economic forecasts, or market reports

IF IN DOUBT: reject. Only accept stories where a stranger would smile reading the headline with zero context.

Category definitions — pick exactly one:
- environment: nature thriving, forests growing, clean energy milestones, rivers restored, wildlife habitats protected
- community: people helping people, neighbourhoods coming together, volunteers, acts of kindness, local initiatives
- animals: individual animals rescued or thriving, pet stories, wildlife populations booming, species returning
- science: discoveries, inventions, space exploration, breakthroughs that expand human knowledge
- achievement: records broken, firsts achieved, personal or collective triumphs, graduations, extraordinary feats
- culture: art, music, sport, food, festivals, traditions, creative works that brought people joy

Rules:
- is_positive: see strict criteria above
- title: the article title in English. If the original title is already in English, copy it exactly. If it is in another language, translate it naturally to English — do not transliterate, write a proper English headline.
- summary: always write in English, regardless of the source article language.
- country/country_code: the country where this news would be MOST EXCITING AND RELEVANT — ask yourself "who is the primary audience cheering for this?" A Swedish driver winning a race in the US = SE (Sweden is celebrating, not the US). A Costa Rican film winning at Cannes = CR. A Ghanaian footballer called up to the national squad = GH. A Japanese scientist making a discovery at a US university = JP. A local community project in Kenya = KE. Only use the physical location country if there is no more relevant home country (e.g. a purely local US story with no foreign subject). If no single country is the clear primary audience (global initiative, international treaty, online-only), use null.
- category: must be one of exactly: environment, community, animals, science, achievement, culture`
}

async function classify(article: RawArticle): Promise<ClaudeResult | null> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(article) }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  // Extract the first {...} block, ignoring any markdown fences or trailing explanation
  const match = raw.match(/\{[\s\S]*\}/)
  const text = match ? match[0] : ''

  try {
    return JSON.parse(text) as ClaudeResult
  } catch {
    console.error('[classify] Bad JSON from Claude:', text.slice(0, 120))
    return null
  }
}

export async function processAndStore(articles: RawArticle[]): Promise<void> {
  // Fetch existing hashes so we skip duplicates
  const { data: existing } = await supabase.from('stories').select('url_hash')
  const seen = new Set((existing ?? []).map((r: { url_hash: string }) => r.url_hash))

  let stored = 0
  let skipped = 0

  for (const article of articles) {
    if (seen.has(article.url_hash)) { skipped++; continue }

    let result: ClaudeResult | null = null
    try {
      result = await classify(article)
    } catch (err) {
      console.error('[process] Claude call failed:', (err as Error).message)
      skipped++
      continue
    }

    if (!result?.is_positive || !result.country_code) {
      console.log(`  [skip] not positive or no country_code | "${article.title.slice(0, 60)}"`)
      skipped++; continue
    }

    const code = result.country_code.toUpperCase()
    const centroid = COUNTRY_CENTROIDS[code]
    console.log(`  [${centroid ? 'ok  ' : 'MISS'}] ${code} | "${article.title.slice(0, 60)}"`)
    if (!centroid) { skipped++; continue }

    const { error } = await supabase.from('stories').insert({
      title: result.title ?? article.title,
      url: article.url,
      url_hash: article.url_hash,
      source: article.source,
      country: result.country,
      country_code: result.country_code,
      lat: centroid.lat,
      lng: centroid.lng,
      summary: result.summary,
      category: result.category,
      published_at: article.published_at,
    })

    if (error) {
      console.error('[store] Insert failed:', error.message)
      skipped++
    } else {
      stored++
      seen.add(article.url_hash)
    }

    // Respect Anthropic rate limits
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`[pipeline] Done — ${stored} stored, ${skipped} skipped`)
}

export async function clearAllStories(): Promise<void> {
  const { error } = await supabase.from('stories').delete().not('id', 'is', null)
  if (error) throw new Error('Clear failed: ' + error.message)
  console.log('[pipeline] stories table cleared')
}
