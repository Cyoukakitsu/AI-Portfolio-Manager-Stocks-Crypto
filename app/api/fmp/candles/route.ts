// API Route：代理 FMP 股票历史价格数据
//
// 接收 symbol 和时间范围，返回统一格式的每日收盘价
// 供 ProfitAreaChart 计算每天的组合市值和收益率
//
// FMP 接口文档（新版 stable API）：
// GET /stable/historical-price-eod/full?symbol=AAPL&from=YYYY-MM-DD&to=YYYY-MM-DD&apikey=xxx

import { NextRequest, NextResponse } from "next/server";

// 根据时间范围计算起始日期字符串（FMP 用 YYYY-MM-DD 格式，不用 UNIX timestamp）
function getFromDate(range: string): string {
  const now = new Date();

  if (range === "YTD") {
    // 从今年1月1日开始
    return `${now.getFullYear()}-01-01`;
  }

  const daysMap: Record<string, number> = {
    "1D": 1,
    "5D": 5,
    "1M": 30,
    "6M": 180,
    "1Y": 365,
  };

  const days = daysMap[range] ?? 30;
  const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 转成 YYYY-MM-DD 格式
  return fromDate.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const range = req.nextUrl.searchParams.get("range") ?? "1M";

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FMP_API_KEY is not defined" },
      { status: 500 },
    );
  }

  const fromDate = getFromDate(range);
  const toDate = new Date().toISOString().split("T")[0]; // 今天

  try {
    const res = await fetch(
      `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${encodeURIComponent(symbol)}&from=${fromDate}&to=${toDate}&apikey=${apiKey}`,
    );
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`FMP ${res.status}: ${errBody}`);
    }

    const data = await res.json();

    // 新版 API 返回 { historical: [...] } 或直接返回数组
    const historical: { date: string; close: number }[] = Array.isArray(data)
      ? data
      : data.historical ?? [];

    if (historical.length === 0) {
      return NextResponse.json({ candles: [] });
    }

    // FMP 返回的是降序（最新在前），转成升序方便前端按日期顺序画图
    const candles = historical
      .map((item) => ({ date: item.date, close: item.close }))
      .reverse(); // 升序排列

    return NextResponse.json({ candles });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch candles";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
