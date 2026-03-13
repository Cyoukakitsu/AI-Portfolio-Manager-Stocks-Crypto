import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim() === "") {
    return NextResponse.json([]);
  }

  try {
    const result = await yf.search(query);

    const results = result.quotes.slice(0, 5).map((item) => ({
      symbol: item.symbol,
      fullname:
        "longname" in item
          ? item.longname
          : "shortname" in item
            ? item.shortname
            : item.symbol,
      type: item.quoteType,
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching data." },
      { status: 500 },
    );
  }
}
