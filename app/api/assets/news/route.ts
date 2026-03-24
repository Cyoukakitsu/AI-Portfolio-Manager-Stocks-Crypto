import { NextRequest, NextResponse } from "next/server";

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedDate: string;
  content: string;
}

export interface SymbolNews {
  symbol: string;
  articles: NewsArticle[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");

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

  const results: SymbolNews[] = await Promise.all(
    symbols.map(async (symbol): Promise<SymbolNews> => {
      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            query: `${symbol} stock news today`,
            max_results: 1,
            search_depth: "basic",
            include_answer: false,
          }),
        });

        if (!res.ok) {
          return { symbol, articles: [] };
        }

        const data = await res.json();
        const articles: NewsArticle[] = (data.results ?? []).map(
          (r: { title: string; url: string; source?: string; published_date?: string; content?: string }) => ({
            title: r.title,
            url: r.url,
            source: r.source ?? new URL(r.url).hostname.replace("www.", ""),
            publishedDate: r.published_date ?? "",
            content: r.content ?? "",
          })
        );

        return { symbol, articles };
      } catch {
        return { symbol, articles: [] };
      }
    })
  );

  return NextResponse.json({ results });
}
