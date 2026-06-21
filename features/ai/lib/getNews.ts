// AI 工具函数——让 AI 模型能够主动查询指定 symbol 的新闻
import { tool } from "ai";
import { z } from "zod";
import { fetchNews } from "@/lib/news-fetcher";

export const getNews = tool({
  description:
    "Search recent news articles for a stock or crypto or etf asset by its symbol.",

  inputSchema: z.object({
    symbol: z
      .string()
      .describe("The stock or crypto or etf symbol, e.g. AAPL, BTC-USD, SPY"),
  }),

  strict: true,

  execute: async ({ symbol }) => {
    const articles = await fetchNews(`${symbol} news`, { maxResults: 5 });
    return { symbol, articles };
  },
});
