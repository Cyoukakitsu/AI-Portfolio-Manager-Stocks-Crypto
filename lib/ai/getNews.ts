import { tool } from "ai";
import { z } from "zod";

export const getNews = tool({
  description:
    "Search recent news articles for a stock or crypto asset by its symbol.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("The stock or crypto symbol, e.g. AAPL, BTC-USD"),
  }),
  strict: true,
  execute: async ({ symbol }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return { symbol, articles: [] };

    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: `${symbol} stock news`,
          max_results: 5, // Agent 用，多拿几条
          search_depth: "basic",
          include_answer: false,
        }),
      });

      if (!res.ok) return { symbol, articles: [] };

      const data = await res.json();

      const articles = (data.results ?? []).map(
        (r: {
          title: string;
          url: string;
          source?: string;
          published_date?: string;
          content?: string;
        }) => ({
          title: r.title,
          url: r.url,
          source: r.source ?? new URL(r.url).hostname.replace("www.", ""),
          publishedDate: r.published_date ?? "",
          content: r.content ?? "",
        }),
      );

      return { symbol, articles };
    } catch {
      return { symbol, articles: [] };
    }
  },
});
