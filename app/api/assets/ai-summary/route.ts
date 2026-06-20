import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { tavilySearch } from "@tavily/ai-sdk";
import { streamText, stepCountIs } from "ai";
import yf from "@/lib/yahoo-finance";
import { buildLangInstruction } from "@/lib/lang-instruction";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { assets, locale } = await req.json();

  const rawAssets = assets as {
    fullname: string;
    symbol: string;
    total_quantity: number;
    total_cost: number;
  }[];

  // 并行获取所有持仓的实时价格
  const enriched = await Promise.all(
    rawAssets.map(async (a) => {
      let currentPrice: number | null = null;
      try {
        const q = await yf.quote(a.symbol);
        currentPrice = q.regularMarketPrice ?? null;
      } catch {
        // 价格获取失败时保持 null
      }
      const currentValue =
        currentPrice !== null ? currentPrice * a.total_quantity : null;
      const pnlPct =
        currentValue !== null && a.total_cost > 0
          ? ((currentValue - a.total_cost) / a.total_cost) * 100
          : null;
      return { ...a, currentPrice, currentValue, pnlPct };
    })
  );

  const holdingsText = enriched
    .map((a) => {
      const price =
        a.currentPrice !== null ? `$${a.currentPrice.toFixed(2)}` : "N/A";
      const value =
        a.currentValue !== null ? `$${a.currentValue.toFixed(2)}` : "N/A";
      const pnl =
        a.pnlPct !== null
          ? `${a.pnlPct >= 0 ? "+" : ""}${a.pnlPct.toFixed(1)}%`
          : "N/A";
      return `${a.fullname} (${a.symbol}): qty=${a.total_quantity}, cost=$${a.total_cost.toFixed(2)}, current_price=${price}, current_value=${value}, pnl=${pnl}`;
    })
    .join("\n");

  // 按总成本排序找最大持仓，用于新闻搜索
  const largest = [...enriched].sort((a, b) => b.total_cost - a.total_cost)[0];

  const result = streamText({
    model: openrouter("openrouter/free"),
    tools: {
      tavilySearch: tavilySearch({ maxResults: 2 }),
    },
    stopWhen: stepCountIs(4),
    system: `You are a senior portfolio analyst. Deliver a structured, data-driven portfolio review — no filler, no generic advice.${buildLangInstruction(locale)}

Output exactly these four sections in order (translate section titles to the output language):

## 📊 HOLDINGS SNAPSHOT
A GFM markdown table. Columns (translate headers to output language): Symbol | Qty | Cost | Current Value | P&L%
Use the real-time data provided. If price is N/A, show N/A.

## 🎯 RISK SCORES (1–10)
Three one-line bullets (translate labels to output language):
- Concentration Risk: X/10 — [reason citing largest position]
- Sector Risk: X/10 — [reason citing sector concentration]
- Macro Risk: X/10 — [reason citing current macro conditions]

## ⚠️ TOP 3 RISKS
Three numbered risks. Name the specific holding(s) and quantify potential impact. Reference news if relevant.

## ✅ ACTION ITEMS
2–3 concrete, prioritized actions. Name specific positions and suggest % adjustments. No generic advice.`,
    prompt: `Analyze this portfolio:

${holdingsText}

Step 1 — Search: Use tavilySearch to find the latest news (past 48h) for ${largest.fullname} (${largest.symbol}), the largest position by cost. Focus on earnings, analyst rating changes, or major catalysts.

Step 2 — Analyze: Using the search results and the real-time P&L data above, evaluate concentration, sector exposure, fundamental strength, and macro risk factors.

Step 3 — Output: Fill in all four sections exactly as specified in your instructions.`,
  });

  return result.toTextStreamResponse();
}
