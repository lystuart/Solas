import { RSS_SOURCES } from './sources'
import { fetchAllFeeds } from './fetch-rss'
import { processAndStore, clearAllStories } from './process-stories'

const REQUIRED_ENV = [
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

function checkEnv(): void {
  const missing = REQUIRED_ENV.filter(k => !process.env[k])
  if (missing.length > 0) {
    console.error(`[pipeline] Missing env vars: ${missing.join(', ')}`)
    console.error('Fill in .env.local or set GitHub Secrets before running.')
    process.exit(1)
  }
}

async function main(): Promise<void> {
  checkEnv()
  if (process.argv.includes('--clear')) {
    await clearAllStories()
  }
  console.log(`[pipeline] Fetching from ${RSS_SOURCES.length} sources...`)
  const articles = await fetchAllFeeds(RSS_SOURCES)
  console.log(`[pipeline] Fetched ${articles.length} articles`)
  await processAndStore(articles)
}

main().catch(err => {
  console.error('[pipeline] Fatal:', (err as Error).message)
  process.exit(1)
})
