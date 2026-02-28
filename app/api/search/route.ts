import { NextRequest, NextResponse } from "next/server";

type FinnhubResult = {
  symbol: string;
  description: string;
  type: string;
  displaySymbol: string;
};
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim() === "") {
    return NextResponse.json([]);
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
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`,
    );
    if (!res.ok) throw new Error("Finnhub API error");

    const data = await res.json();

    const results = (data.result as FinnhubResult[])
      .slice(0, 5)
      .map((item) => ({
        symbol: item.symbol,
        fullname: item.description,
        type: item.type,
      }));
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching data." },
      { status: 500 },
    );
  }
}
