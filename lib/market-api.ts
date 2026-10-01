// 客户端访问行情接口的唯一入口（目前走 /api/yahoofinance/*，任务 1.4 会改成 server actions）
export type QuoteData = { price: number | null; prevClose: number | null };

export type SearchResult = {
  symbol: string; // 如 AAPL
  fullname: string;
  type: string; // Yahoo 的 quoteType，如 EQUITY / CRYPTOCURRENCY
};

export const EMPTY_QUOTE: QuoteData = { price: null, prevClose: null };

// 单个报价；任何失败都按“无报价”处理，避免一个 symbol 拖垮整个列表
export async function fetchQuote(symbol: string): Promise<QuoteData> {
  try {
    const res = await fetch(
      `/api/yahoofinance/quote?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) return EMPTY_QUOTE;
    const data = await res.json();
    return { price: data.price, prevClose: data.prevClose };
  } catch {
    return EMPTY_QUOTE;
  }
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `/api/yahoofinance/search?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new Error("search failed");
  return res.json();
}

export async function fetchHistory(symbols: string, from: string, to: string) {
  const res = await fetch(
    `/api/yahoofinance/history?symbols=${encodeURIComponent(symbols)}&from=${from}&to=${to}`,
  );
  if (!res.ok) throw new Error("history failed");
  return res.json();
}
