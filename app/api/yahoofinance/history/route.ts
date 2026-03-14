import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function GET(req: NextRequest) {
  const symbolsParam = req.nextUrl.searchParams.get("symbols");
  const symbols =
    symbolsParam
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const period1 = req.nextUrl.searchParams.get("from");
  const period2 = req.nextUrl.searchParams.get("to");

  if (symbols.length === 0 || !period1) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const result = await yf.historical(symbol, {
          period1,
          period2: period2 ?? new Date().toISOString().split("T")[0],
        });

        const candles = result.map((day) => ({
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
  return NextResponse.json({ results });
}
