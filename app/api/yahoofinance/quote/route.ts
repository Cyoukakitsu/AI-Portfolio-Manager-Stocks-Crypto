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
    const prevClose = quote.regularMarketPreviousClose ?? null;

    return NextResponse.json({ price, prevClose });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 },
    );
  }
}
