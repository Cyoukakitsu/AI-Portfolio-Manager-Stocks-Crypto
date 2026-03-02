// API Route：代理 Finnhub 股票/加密货币符号搜索
//
// 为什么不在前端直接调用 Finnhub？
//   - Finnhub API Key 是敏感凭证，不能暴露在浏览器端（会被任何人看到）
//   - 通过这个 API Route 中转，Key 只在服务端环境变量中存在

import { NextRequest, NextResponse } from "next/server";

// Finnhub /search 接口返回的原始数据结构
type FinnhubResult = {
  symbol: string;
  description: string; // Finnhub 用 description 存公司全名
  type: string;
  displaySymbol: string;
};

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  // 空查询直接返回空数组，避免浪费 Finnhub 的 API 调用次数
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

    // 只取前 5 条结果，避免下拉列表过长影响 UX；
    // 同时将 Finnhub 的字段名（description）重命名为项目内统一的 fullname
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
