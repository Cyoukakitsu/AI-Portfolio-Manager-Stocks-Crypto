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

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const price = (quote.regularMarketPrice ??
      quote.postMarketPrice ??
      quote.preMarketPrice ??
      null) as number | null;
    const prevClose = (quote.regularMarketPreviousClose ?? null) as
      | number
      | null;

    return NextResponse.json({ price, prevClose });
  } catch (err) {
    console.error(`[API] Error fetching quote for ${symbol}:`, err);
    return NextResponse.json(
      {
        error: "Failed to fetch quote",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
