import { tool } from "ai";
import { z } from "zod";

export const getNews = tool({
  description:
    "Search recent news articles for a stock or crypto or etf asset by its symbol.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("The stock or crypto or etf symbol, e.g. AAPL, BTC-USD, SPY"),
  }),
  //AI 传入的参数只能包含inputSchema中定义的symbol字段
  strict: true,

  execute: async ({ symbol }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return { symbol, articles: [] };

    //调用 Tavily 搜索 API
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: `${symbol} news`,
          topic: "news",
          max_results: 5, // Agent 用，多拿几条
          search_depth: "basic",
          include_answer: false, // 不返回 Tavily 生成的总结答案，只返回原始新闻。
        }),
      });

      if (!res.ok) return { symbol, articles: [] };

      //解析 API 响应的 JSON 数据
      const data = await res.json();

      //格式化新闻数据
      const articles = (data.results ?? []).map(
        (results: {
          title: string;
          url: string;
          source?: string;
          published_date?: string;
          content?: string;
        }) => ({
          title: results.title,
          url: results.url,
          source:
            results.source ?? new URL(results.url).hostname.replace("www.", ""),
          publishedDate: results.published_date ?? "",
          content: results.content ?? "",
        }),
      );

      return { symbol, articles };
    } catch {
      return { symbol, articles: [] };
    }
  },
});
