// AI 工具函数 —— 让 AI 模型能够主动查询股票财务数据（企业基本面）
//参考：https://ai-sdk.dev/docs/reference/ai-sdk-core/tool

import { tool } from "ai";
import YahooFinance from "yahoo-finance2";
import { z } from "zod";

const yf = new YahooFinance();

export const getFinancials = tool({
  // AI 工具描述
  description:
    "Get fundamental financial data for a stock, including valuation, profitability and growth metrics.",

  //定义输入参数的验证规则
  inputSchema: z.object({
    symbol: z.string().describe("The stock symbol, e.g. AAPL, TSLA"),
  }),

  // 严格模式，确保参数符合 schema
  strict: true,

  // AI 工具执行函数
  execute: async ({ symbol }) => {
    try {
      const result = await yf.quoteSummary(symbol, {
        //通过指定 modules，可以选择需要的财务数据,好处是：1.减少不必要的数据传输 2.提高 API 响应速度
        modules: ["financialData", "summaryDetail", "defaultKeyStatistics"],
      });

      //结果分别赋值给三个变量，便于后续使用
      const fin = result.financialData;
      const summary = result.summaryDetail;
      const stats = result.defaultKeyStatistics;

      return {
        symbol,
        // 估值
        peRatio: summary?.trailingPE ?? null, // 市盈率
        pbRatio: summary?.priceToBook ?? null, // 市净率
        marketCap: summary?.marketCap ?? null, // 市值
        // 盈利能力
        roe: fin?.returnOnEquity ?? null, // 净资产收益率
        profitMargin: fin?.profitMargins ?? null, // 净利率
        // 成长性
        revenueGrowth: fin?.revenueGrowth ?? null, // 营收增速
        earningsGrowth: fin?.earningsGrowth ?? null, // 利润增速
        // 现金流
        freeCashFlow: fin?.freeCashflow ?? null, // 自由现金流
        // 每股数据
        eps: stats?.trailingEps ?? null, // 每股收益
      };
    } catch {
      return { symbol, error: "Failed to fetch financials" };
    }
  },
});
