"use server";

// 行情 Server Actions：报价、搜索、历史 K 线（仅供 lib/market-api.ts 调用）
// Server Action 同样是公开的 POST 端点，所以每个 action 先校验身份
// 报价按批量设计：Next 会把同一客户端的 action 串行执行，逐个 symbol 调用会排队
import { rejectIfUnauthenticated } from "@/lib/api-auth";
import yf from "@/lib/yahoo-finance";

type QuoteData = { price: number | null; prevClose: number | null };

async function requireUser() {
  if (await rejectIfUnauthenticated()) throw new Error("Unauthorized");
}

// 任何单个 symbol 失败都按“无报价”处理，避免拖垮整个列表
export async function getQuotes(
  symbols: string[],
): Promise<Record<string, QuoteData>> {
  await requireUser();
  const entries = await Promise.all(
    symbols.map(async (symbol): Promise<[string, QuoteData]> => {
      try {
        const quote = await yf.quote(symbol);
        return [
          symbol,
          {
            price:
              quote.regularMarketPrice ??
              quote.postMarketPrice ??
              quote.preMarketPrice ??
              null,
            prevClose: quote.regularMarketPreviousClose ?? null,
          },
        ];
      } catch (err) {
        console.error(`[market] Error fetching quote for ${symbol}:`, err);
        return [symbol, { price: null, prevClose: null }];
      }
    }),
  );
  return Object.fromEntries(entries);
}

export async function searchSymbols(
  query: string,
): Promise<{ symbol: string; fullname: string; type: string }[]> {
  await requireUser();
  if (query.trim() === "") return [];

  try {
    const result = await yf.search(query);
    return result.quotes
      .filter((item) => item.isYahooFinance === true) // 排除无 symbol 的非行情条目
      .slice(0, 5)
      .map((item) => ({
        symbol: item.symbol,
        fullname:
          ("longname" in item && item.longname) ||
          ("shortname" in item && item.shortname) ||
          item.symbol,
        type: item.quoteType,
      }));
  } catch (err) {
    // yahoo-finance2 对个别返回结构校验失败，视为无结果
    if (err instanceof Error && err.message.includes("Failed validation")) {
      console.warn("[market] search validation warning:", err.message);
      return [];
    }
    throw err;
  }
}

export async function getHistory(symbols: string[], from: string, to: string) {
  await requireUser();
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const rows = await yf.historical(symbol, {
          period1: from,
          period2: to,
        });
        const candles = rows.map((day) => ({
          date: day.date.toISOString().split("T")[0],
          open: day.open,
          high: day.high,
          low: day.low,
          close: day.close,
          volume: day.volume,
        }));
        return { symbol, candles };
      } catch {
        return { symbol, candles: [] };
      }
    }),
  );
  return { results };
}
