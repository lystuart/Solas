import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data, error } = await sb
    .from('stories')
    .select('title, summary')
    .order('country_code')
    .limit(10)

  if (error) { console.error(error.message); process.exit(1) }

  for (const r of data) {
    console.log('TITLE:  ', r.title)
    console.log('SUMMARY:', r.summary)
    console.log('LENGTH: ', r.summary?.length ?? 0, 'chars')
    console.log('---')
  }
  console.log(`Total rows sampled: ${data.length}`)
}

main()
