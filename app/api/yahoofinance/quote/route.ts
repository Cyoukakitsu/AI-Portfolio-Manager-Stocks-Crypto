// API Route：代理 Finnhub 股票实时报价
//
// Finnhub /quote 接口返回的字段：
//   c = 当前价格（current price）
//   o = 开盘价、h = 最高价、l = 最低价（本次用不到）

import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");

  if (!symbol || symbol.trim() === "") {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const quote = await yf.quote(symbol);

    const price = quote.regularMarketPrice ?? null;

    return NextResponse.json({ price });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 },
    );
  }
}
