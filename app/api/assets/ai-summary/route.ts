import { groq } from "@ai-sdk/groq";
import { tavilySearch } from "@tavily/ai-sdk";
import { streamText, stepCountIs } from "ai";

export async function POST(req: Request) {
  const { assets } = await req.json();

  const holdings = (assets as { fullname: string; symbol: string; total_quantity: number; total_cost: number }[])
    .map((a) => `${a.fullname} (${a.symbol}), qty: ${a.total_quantity}, cost: $${a.total_cost.toFixed(2)}`)
    .join("\n");

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    tools: {
      tavilySearch: tavilySearch({ maxResults: 2 }),
    },
    stopWhen: stepCountIs(4),
    system: `You are a professional portfolio analyst. Be concise and insightful.
Always respond in Japanese.
Structure your response EXACTLY like this (use these exact markdown headers):
## 総合評価
1〜2文で全体的な見通しを述べる。

## 注目ポイント
- 箇条書きで2〜3点

## リスク
- 箇条書きで2〜3点

## 推奨アクション
1文で具体的なアドバイスを述べる。`,
    prompt: `以下の持ち株ポートフォリオを分析してください：
${holdings}

最も比重の高い銘柄についてtavilySearchで最新ニュースを検索してから、
テクニカルトレンド・企業ファンダメンタルズ・業界動向を踏まえた分析をお願いします。`,
  });

  return result.toTextStreamResponse();
}
