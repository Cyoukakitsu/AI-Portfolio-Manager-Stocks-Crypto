import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const period1 = req.nextUrl.searchParams.get("from");
  const period2 = req.nextUrl.searchParams.get("to");

  if (!symbol || !period1) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

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

    return NextResponse.json({ candles });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
