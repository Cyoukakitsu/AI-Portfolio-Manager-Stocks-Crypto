// POST /api/ai-analysis — 运行 1-2 个 AI 分析师 agent，SSE 流式返回分析结果与 coordinator 综合结论
import { rejectIfUnauthenticated } from "@/lib/api-auth";
import { deepseek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import yf from "@/lib/yahoo-finance";
import { buildLangInstruction } from "@/lib/lang-instruction";
import { AgentPersona } from "@/features/ai/types";

import { runPersona } from "@/features/ai/server/run-persona";
import { cleanJSON, parseAgent } from "@/features/ai/lib/parse-agent";
import {
  COORDINATOR_PROMPT,
} from "@/features/ai/lib/prompts";

function sseEvent(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  );
}

export async function POST(request: Request) {
  const denied = await rejectIfUnauthenticated();
  if (denied) return denied;

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
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 每个 persona 一完成就立即推送，不等另一个
        const analyze = (persona: AgentPersona, event: string) =>
          runPersona(persona, symbol, langInstruction).then((text) => {
            const result = parseAgent(text, persona);
            controller.enqueue(sseEvent(event, result));
            return result;
          });

        if (personas.length === 1) {
          await analyze(personas[0], "agent1_done");
        } else {
          const [result1, result2, quote] = await Promise.all([
            analyze(personas[0], "agent1_done"),
            analyze(personas[1], "agent2_done"),
            yf.quote(symbol).catch(() => null),
          ]);

          const currentPrice = quote?.regularMarketPrice ?? 0;
          const agentResults = [result1, result2];

          const coordinatorResult = await generateText({
            model: deepseek("deepseek-v4-flash"),
            providerOptions: {
              deepseek: { thinking: { type: "disabled" } },
            },
            system: `${COORDINATOR_PROMPT}${langInstruction}`,
            prompt: `
      Current market price: $${currentPrice}
      Agent 1 (${personas[0]}): ${JSON.stringify(agentResults[0])}
      Agent 2 (${personas[1]}): ${JSON.stringify(agentResults[1])}

      Synthesize these two perspectives and give your final recommendation for ${symbol}.`,
          });

          let coordinator;
          try {
            coordinator = JSON.parse(cleanJSON(coordinatorResult.text));
          } catch {
            coordinator = {
              verdict: "hold",
              score: 50,
              summary: coordinatorResult.text,
              buyRange: { low: 0, high: 0 },
            };
          }

          controller.enqueue(sseEvent("coordinator_done", coordinator));
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
