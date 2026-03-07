// API Route：代理 Finnhub 股票实时报价
//
// Finnhub /quote 接口返回的字段：
//   c = 当前价格（current price）
//   o = 开盘价、h = 最高价、l = 最低价（本次用不到）

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");

  if (!symbol || symbol.trim() === "") {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINNHUB_API_KEY is not defined" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
    );
    if (!res.ok) throw new Error("Finnhub API error");
    const data = await res.json();

    if (data.c === 0) {
      return NextResponse.json({ price: null });
    }

    return NextResponse.json({ price: data.c });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 },
    );
  }
}
