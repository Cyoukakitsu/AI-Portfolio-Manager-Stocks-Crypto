// POST /api/ai-analysis — 运行 1-2 个 AI 分析师 agent，SSE 流式返回分析结果与 coordinator 综合结论
import { deepseek } from "@ai-sdk/deepseek";
import { generateText, Output, stepCountIs } from "ai";
import yf from "@/lib/yahoo-finance";
import { buildLangInstruction } from "@/lib/lang-instruction";
import { AgentPersona, AgentResult } from "@/features/ai/types";

import { getStockPrice } from "@/features/ai/lib/getStockPrice";
import { getFinancials } from "@/features/ai/lib/getFinancials";
import { getNews } from "@/features/ai/lib/getNews";
import {
  agentOutputSchema,
  coordinatorOutputSchema,
} from "@/features/ai/lib/schemas";
import {
  ANALYSIS_PROMPT,
  COORDINATOR_PROMPT,
  PERSONA_PROMPTS,
} from "@/features/ai/lib/prompts";

function sseEvent(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
  );
}

export async function POST(request: Request) {
  const {
    symbol,
    personas,
    locale,
  }: { symbol: string; personas: AgentPersona[]; locale?: string } =
    await request.json();

  const langInstruction = buildLangInstruction(locale);

  if (!symbol || !personas || personas.length < 1 || personas.length > 2) {
    return Response.json(
      { error: "symbol and 1 or 2 personas are required" },
      { status: 400 },
    );
  }

  // 单个分析师：工具循环 + 结构化输出（schema 校验失败会抛错，由外层转成 SSE error）
  const runAgent = async (persona: AgentPersona): Promise<AgentResult> => {
    const { output } = await generateText({
      model: deepseek("deepseek-v4-flash"),
      tools: { getStockPrice, getFinancials, getNews },
      stopWhen: stepCountIs(5),
      system: `${PERSONA_PROMPTS[persona]}${langInstruction}`,
      prompt: ANALYSIS_PROMPT(symbol),
      output: Output.object({ schema: agentOutputSchema }),
    });
    return { persona, ...output };
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const [results, quote] = await Promise.all([
          Promise.all(
            personas.map((p, i) =>
              runAgent(p).then((r) => {
                controller.enqueue(sseEvent(`agent${i + 1}_done`, r));
                return r;
              }),
            ),
          ),
          personas.length === 2 ? yf.quote(symbol).catch(() => null) : null,
        ]);

        if (results.length === 2) {
          const { output } = await generateText({
            model: deepseek("deepseek-v4-flash"),
            providerOptions: {
              deepseek: { thinking: { type: "disabled" } },
            },
            system: `${COORDINATOR_PROMPT}${langInstruction}`,
            prompt: `
      Current market price: $${quote?.regularMarketPrice ?? 0}
      Agent 1 (${personas[0]}): ${JSON.stringify(results[0])}
      Agent 2 (${personas[1]}): ${JSON.stringify(results[1])}

      Synthesize these two perspectives and give your final recommendation for ${symbol}.`,
            output: Output.object({ schema: coordinatorOutputSchema }),
          });
          controller.enqueue(sseEvent("coordinator_done", output));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[ai-analysis] Error:", message, err);
        controller.enqueue(sseEvent("error", { message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
