import { tool } from "ai";
import YahooFinance from "yahoo-finance2";
import { z } from "zod";

const yf = new YahooFinance();

export const getFinancials = tool({
  description:
    "Get fundamental financial data for a stock, including valuation, profitability and growth metrics.",
  inputSchema: z.object({
    symbol: z.string().describe("The stock symbol, e.g. AAPL, TSLA"),
  }),
  strict: true,
  execute: async ({ symbol }) => {
    try {
      const result = await yf.quoteSummary(symbol, {
        modules: ["financialData", "summaryDetail", "defaultKeyStatistics"],
      });

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
