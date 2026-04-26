import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { tavilySearch } from "@tavily/ai-sdk";
import { streamText, stepCountIs } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { assets, locale } = await req.json();

  const holdings = (assets as { fullname: string; symbol: string; total_quantity: number; total_cost: number }[])
    .map((a) => `${a.fullname} (${a.symbol}), qty: ${a.total_quantity}, cost: $${a.total_cost.toFixed(2)}`)
    .join("\n");

  const result = streamText({
    model: openrouter("openrouter/free"),
    tools: {
      tavilySearch: tavilySearch({ maxResults: 2 }),
    },
    stopWhen: stepCountIs(4),
    system: `You are a senior portfolio analyst with expertise in equities, ETFs, and crypto assets.
Your job: deliver a concise, data-driven portfolio review — no filler, no generic advice.

Always respond in the language matching locale "${locale}".

Output format (use these exact markdown headers, in order):

## Portfolio Snapshot
One sentence on overall positioning: concentration, sector mix, or asset class balance.

## What's Working
- 2–3 bullets on strongest holdings or tailwinds (cite recent news if found)

## Key Risks
- 2–3 bullets on concentration risk, macro headwinds, or company-specific concerns

## Action Items
- 1–2 concrete, prioritized actions the investor should consider this week`,
    prompt: `Analyze this portfolio:
${holdings}

Step 1 — Search: Use tavilySearch to find the latest news (past 48h) for the largest position by total cost. Focus on earnings, analyst rating changes, or major catalysts.

Step 2 — Analyze: Using the search results and your knowledge, evaluate:
- Concentration & diversification (sector, asset class)
- Fundamental strength of top holdings (revenue trend, competitive moat)
- Risk factors (macro, regulatory, valuation)

Step 3 — Recommend: Give specific, prioritized action items based on current market context. Avoid generic advice like "diversify" — be precise about which positions and why.`,
  });

  return result.toTextStreamResponse();
}
