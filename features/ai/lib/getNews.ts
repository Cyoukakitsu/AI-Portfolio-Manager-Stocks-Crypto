// AI 工具函数 —— 让 AI 模型能够主动查询股票新闻
//参考：https://ai-sdk.dev/docs/reference/ai-sdk-core/tool

import { tool } from "ai";
import { z } from "zod";

export const getNews = tool({
  // AI 工具描述
  description:
    "Search recent news articles for a stock or crypto or etf asset by its symbol.",

  //定义输入参数的验证规则
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("The stock or crypto or etf symbol, e.g. AAPL, BTC-USD, SPY"),
  }),

  // 严格模式，确保参数符合 schema
  strict: true,

  // AI 工具执行函数
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
