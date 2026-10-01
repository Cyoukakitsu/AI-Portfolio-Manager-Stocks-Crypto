// GET /api/assets/news — 按 symbol 拉取今日新闻，Supabase JST 日期缓存，最多 10 个 symbol
import { rejectIfUnauthenticated } from "@/lib/api-auth";
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
  const denied = await rejectIfUnauthenticated();
  if (denied) return denied;

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
        // supabase-js 不抛异常，失败体现在 error 里；读失败按缓存未命中处理
        const { data: cached, error } = await supabase
          .from("news_cache")
          .select("articles")
          .eq("symbol", symbol)
          .eq("cached_date", todayJST)
          .maybeSingle();
        if (error) console.error("[news_cache] read failed:", error);
        if (cached) {
          return { symbol, articles: cached.articles as NewsArticle[] };
        }
      }

      // fetchNews 内部已处理超时与失败，失败时返回空数组
      const articles: NewsArticle[] = await fetchNews(
        `${symbol} stock news today`,
        { maxResults: 1, timeoutMs: 5000 },
      );

      // 写缓存失败不影响返回
      const { error } = await supabase.from("news_cache").upsert({
        symbol,
        articles,
        cached_date: todayJST,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error("[news_cache] write failed:", error);

      return { symbol, articles };
    })
  );

  return NextResponse.json({ results });
}
