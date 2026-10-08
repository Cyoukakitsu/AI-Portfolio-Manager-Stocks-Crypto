// 客户端访问行情的唯一入口：类型 + 对 market-actions（server actions）的薄封装
import { getHistory, getQuotes, searchSymbols } from "@/lib/market-actions";

export type QuoteData = { price: number | null; prevClose: number | null };

export type SearchResult = {
  symbol: string; // 如 AAPL
  fullname: string;
  type: string; // Yahoo 的 quoteType，如 EQUITY / CRYPTOCURRENCY
};

export { getQuotes as fetchQuotes, getHistory as fetchHistory, searchSymbols };
