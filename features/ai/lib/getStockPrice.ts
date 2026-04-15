// AI 工具函数 —— 让 AI 模型能够主动查询股票价格
//参考：https://ai-sdk.dev/docs/reference/ai-sdk-core/tool

import { tool } from "ai";
import YahooFinance from "yahoo-finance2";
import { z } from "zod";

const yf = new YahooFinance();

export const getStockPrice = tool({
  // AI 工具描述
  description:
    "Get the current real-time price of a stock or crypto or etf asset by its symbol.",

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
    // 执行函数，实际查询价格
    const quote = await yf.quote(symbol);

    return {
      symbol,
      price: quote.regularMarketPrice ?? null,
      currency: quote.currency ?? "USD",
    };
  },
});
