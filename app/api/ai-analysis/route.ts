// POST /api/ai-analysis — 运行 1-2 个 Persona，SSE 流式返回分析结果与 Committee Verdict
import { rejectIfUnauthenticated } from "@/lib/api-auth";
import { model, noThinking } from "@/lib/ai";
import { generateText, Output } from "ai";
import yf from "@/lib/yahoo-finance";
import { buildLangInstruction } from "@/lib/lang-instruction";
import { Persona } from "@/features/ai/types";

import { runPersona } from "@/features/ai/server/run-persona";
import { committeeVerdictSchema } from "@/features/ai/lib/schemas";
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
  }: { symbol: string; personas: Persona[]; locale?: string } =
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
      // 客户端断开后流已取消，再 enqueue / close 会抛错，统一在此跳过
      const send = (event: string, data: unknown) => {
        if (!request.signal.aborted) controller.enqueue(sseEvent(event, data));
      };
      try {
        // 每个 persona 一完成就立即推送，不等另一个
        const analyze = (persona: Persona, event: string) =>
          runPersona(persona, symbol, langInstruction, request.signal).then((result) => {
            send(event, result);
            return result;
          });

        if (personas.length === 1) {
          await analyze(personas[0], "persona1_done");
        } else {
          const [result1, result2, quote] = await Promise.all([
            analyze(personas[0], "persona1_done"),
            analyze(personas[1], "persona2_done"),
            yf.quote(symbol).catch(() => null),
          ]);

          const currentPrice = quote?.regularMarketPrice ?? 0;
          const analyses = [result1, result2];

          const { output: committee } = await generateText({
            model,
            abortSignal: request.signal,
            timeout: 30_000,
            output: Output.object({ schema: committeeVerdictSchema }),
            providerOptions: noThinking,
            system: `${COORDINATOR_PROMPT}${langInstruction}`,
            prompt: `
      Current market price: $${currentPrice}
      Persona 1 (${personas[0]}): ${JSON.stringify(analyses[0])}
      Persona 2 (${personas[1]}): ${JSON.stringify(analyses[1])}

      Synthesize these two perspectives and give your final recommendation for ${symbol}.`,
          });

          send("committee_done", committee);
        }
      } catch (err) {
        if (!request.signal.aborted) console.error("[ai-analysis] Error:", err);
        send("error", {});
      } finally {
        if (!request.signal.aborted) controller.close();
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
