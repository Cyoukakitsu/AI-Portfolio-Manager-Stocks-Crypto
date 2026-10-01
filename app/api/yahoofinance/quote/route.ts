// GET /api/yahoofinance/quote — 返回指定 symbol 的实时报价
import { rejectIfUnauthenticated } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";
import yf from "@/lib/yahoo-finance";

export async function GET(req: NextRequest) {
  const denied = await rejectIfUnauthenticated();
  if (denied) return denied;

  const symbol = req.nextUrl.searchParams.get("symbol");

  if (!symbol || symbol.trim() === "") {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const quote = await yf.quote(symbol);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const price =
      quote.regularMarketPrice ??
      quote.postMarketPrice ??
      quote.preMarketPrice ??
      null;
    const prevClose = quote.regularMarketPreviousClose ?? null;

    return NextResponse.json({ price, prevClose });
  } catch (err) {
    console.error(`[API] Error fetching quote for ${symbol}:`, err);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 },
    );
  }
}
