import Parser from 'rss-parser'
import crypto from 'crypto'
import type { RssSource } from './sources'

export interface RawArticle {
  title: string
  url: string
  url_hash: string
  source: string
  content: string
  published_at: string
}

const parser = new Parser()

export async function fetchAllFeeds(sources: RssSource[]): Promise<RawArticle[]> {
  const articles: RawArticle[] = []

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url)

      for (const item of feed.items.slice(0, 20)) {
        const url = item.link ?? ''
        const title = item.title ?? ''
        if (!url || !title) continue

        articles.push({
          title,
          url,
          url_hash: crypto.createHash('md5').update(url).digest('hex'),
          source: source.name,
          content: item.contentSnippet ?? item.content ?? '',
          published_at: item.pubDate ?? new Date().toISOString(),
        })
      }
    } catch (err) {
      // Log and continue — one bad feed must not crash the whole pipeline
      console.error(`[fetch] ${source.name} failed:`, (err as Error).message)
    }
  }

  return articles
}
