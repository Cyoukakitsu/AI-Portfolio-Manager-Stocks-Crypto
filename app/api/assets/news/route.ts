// GET /api/assets/news — 按 symbol 拉取今日新闻，Supabase JST 日期缓存，最多 10 个 symbol
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchNews } from "@/lib/news-fetcher";

import type { NewsArticle, SymbolNews } from "@/features/assets/types";
export type { NewsArticle, SymbolNews };

function getJSTDateString(): string {
  const now = new Date();
  const jstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jstTime.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");
  const force = searchParams.get("force") === "true";

  if (!symbolsParam) {
    return NextResponse.json({ results: [] });
  }

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10); // 最多10个

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TAVILY_API_KEY not configured" },
      { status: 500 }
    );
  }

  const todayJST = getJSTDateString();
  const supabase = await createClient();

  const results: SymbolNews[] = await Promise.all(
    symbols.map(async (symbol): Promise<SymbolNews> => {
      // キャッシュ確認（force=true の場合はスキップ）
      if (!force) {
        try {
          const { data: cached } = await supabase
            .from("news_cache")
            .select("articles")
            .eq("symbol", symbol)
            .eq("cached_date", todayJST)
            .maybeSingle();

          if (cached) {
            return { symbol, articles: cached.articles as NewsArticle[] };
          }
        } catch (err) {
          console.error("[news_cache] read failed:", err);
          // Supabase read 失敗 → キャッシュミスとして扱い Tavily を呼ぶ
        }
      }

      // Tavily API 呼び出し
      try {
        const articles: NewsArticle[] = await fetchNews(
          `${symbol} stock news today`,
          { maxResults: 1, timeoutMs: 5000 },
        );

        // キャッシュへ書き込み（失敗してもクライアントへはそのまま返す）
        try {
          await supabase.from("news_cache").upsert({
            symbol,
            articles,
            cached_date: todayJST,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error("[news_cache] write failed:", err);
          // Supabase write 失敗 → 無視
        }

        return { symbol, articles };
      } catch {
        return { symbol, articles: [] };
      }
    })
  );

  return NextResponse.json({ results });
}
