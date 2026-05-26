import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const revalidate = 300; // Vercel CDN re-fetches from Supabase at most once per 5 minutes

interface Story {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  category: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  published_at: string;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("stories")
    .select("id, title, summary, url, source, category, country, country_code, lat, lng, published_at")
    .gte("published_at", sevenDaysAgo)
    .order("published_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }

  return NextResponse.json(data ?? [], {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
