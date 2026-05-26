export interface RssSource {
  url: string
  name: string
}

export const RSS_SOURCES: RssSource[] = [
  // Dedicated positive-news sources
  { url: 'https://www.goodnewsnetwork.org/feed/', name: 'Good News Network' },
  { url: 'https://positive.news/feed/', name: 'Positive News' },
  { url: 'https://www.upworthy.com/feed', name: 'Upworthy' },

  // Regional coverage (pipeline filters for uplifting stories)
  { url: 'https://www.themoscowtimes.com/rss/news', name: 'The Moscow Times' },         // Russia / Eastern Europe
  { url: 'http://www.scmp.com/rss/91/feed/', name: 'South China Morning Post' },        // China
  { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', name: 'BBC Latin America' }, // South America
  { url: 'https://mercopress.com/rss', name: 'MercoPress' },                             // South America (Argentina/Uruguay/Brazil/Chile)
  { url: 'https://ticotimes.net/feed', name: 'The Tico Times' },                         // Central America (est. 1956, Costa Rica)
  { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', name: 'BBC Africa' },   // Central Africa
  { url: 'https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_NEWS', name: 'Yle News' }, // Finland
  { url: 'https://www.svt.se/nyheter/rss.xml', name: 'SVT Nyheter' },                      // Sweden
  { url: 'https://www.nrk.no/toppsaker.rss', name: 'NRK' },                                 // Norway
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },            // Middle East
  { url: 'https://globalnews.ca/feed/', name: 'Global News' },                          // Canada
  { url: 'https://www.japantimes.co.jp/feed/topstories', name: 'The Japan Times' },    // Japan / Asia-Pacific
]
