// AI 工具定义文件 —— 让 AI 模型能够主动查询外部数据
//参考：https://ai-sdk.dev/docs/reference/ai-sdk-core/tool

import { tool } from "ai";
import YahooFinance from "yahoo-finance2";
import { z } from "zod";

const yf = new YahooFinance();

export const getStockPrice = tool({
  description:
    "Get the current real-time price of a stock or crypto asset by its symbol.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("The stock or crypto symbol, e.g. AAPL, BTC-USD"),
  }),
  strict: true,
  execute: async ({ symbol }) => {
    const quote = await yf.quote(symbol);

    return {
      symbol,
      price: quote.regularMarketPrice ?? null,
      currency: quote.currency ?? "USD",
    };
  },
});
