import { deepseek } from "@ai-sdk/deepseek";
import { generateText, stepCountIs } from "ai";
import YahooFinance from "yahoo-finance2";
import { AgentPersona } from "@/features/ai/types";

import { getStockPrice } from "@/features/ai/lib/getStockPrice";
import { getFinancials } from "@/features/ai/lib/getFinancials";
import { getNews } from "@/features/ai/lib/getNews";
import { cleanJSON, parseAgent } from "@/features/ai/lib/parse-agent";
import {
  ANALYSIS_PROMPT,
  COORDINATOR_PROMPT,
  PERSONA_PROMPTS,
} from "@/features/ai/lib/prompts";

function sseEvent(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  );
}

export async function POST(request: Request) {
  const {
    symbol,
    personas,
    locale,
  }: { symbol: string; personas: AgentPersona[]; locale?: string } =
    await request.json();

  const langInstruction =
    locale === "ja"
      ? "\n\nIMPORTANT: Write all text content (points, summary) in Japanese. Numbers and proper nouns (stock symbols, company names) remain in their original form."
      : "";

  if (!symbol || !personas || personas.length < 1 || personas.length > 2) {
    return Response.json(
      { error: "symbol and 1 or 2 personas are required" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (personas.length === 1) {
          const result = await generateText({
            model: deepseek("deepseek-v4-flash"),
            tools: { getStockPrice, getFinancials, getNews },
            stopWhen: stepCountIs(5),
            system: `${PERSONA_PROMPTS[personas[0]]}${langInstruction}`,
            prompt: ANALYSIS_PROMPT(symbol),
          });
          controller.enqueue(
            sseEvent("agent1_done", parseAgent(result.text, personas[0]))
          );
        } else {
          const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

          const [result1, result2, quote] = await Promise.all([
            generateText({
              model: deepseek("deepseek-v4-flash"),
              tools: { getStockPrice, getFinancials, getNews },
              stopWhen: stepCountIs(5),
              system: `${PERSONA_PROMPTS[personas[0]]}${langInstruction}`,
              prompt: ANALYSIS_PROMPT(symbol),
            }).then((r) => {
              controller.enqueue(
                sseEvent("agent1_done", parseAgent(r.text, personas[0]))
              );
              return r;
            }),
            generateText({
              model: deepseek("deepseek-v4-flash"),
              tools: { getStockPrice, getFinancials, getNews },
              stopWhen: stepCountIs(5),
              system: `${PERSONA_PROMPTS[personas[1]]}${langInstruction}`,
              prompt: ANALYSIS_PROMPT(symbol),
            }).then((r) => {
              controller.enqueue(
                sseEvent("agent2_done", parseAgent(r.text, personas[1]))
              );
              return r;
            }),
            yf.quote(symbol).catch(() => null),
          ]);

          const currentPrice = quote?.regularMarketPrice ?? 0;
          const agentResults = [
            parseAgent(result1.text, personas[0]),
            parseAgent(result2.text, personas[1]),
          ];

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
