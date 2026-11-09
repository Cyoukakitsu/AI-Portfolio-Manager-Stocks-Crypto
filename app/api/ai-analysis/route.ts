// POST /api/ai-analysis — 运行 1-2 个 AI 分析师 agent，SSE 流式返回分析结果与 coordinator 综合结论
import { deepseek } from "@ai-sdk/deepseek";
import { generateText, Output, stepCountIs, streamText } from "ai";
import yf from "@/lib/yahoo-finance";
import { buildLangInstruction } from "@/lib/lang-instruction";
import { getAuthSession } from "@/features/auth/server/auth-helper";
import { AgentPersona, AgentResult } from "@/features/ai/types";

import { getStockPrice } from "@/features/ai/lib/getStockPrice";
import { getFinancials } from "@/features/ai/lib/getFinancials";
import { getNews } from "@/features/ai/lib/getNews";
import {
  agentOutputSchema,
  analysisRequestSchema,
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
  try {
    await getAuthSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = analysisRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { symbol, personas, locale } = parsed.data;

  const langInstruction = buildLangInstruction(locale);

  // 客户端断开（request.signal）或某个 agent 出错（failure.abort）时，中止还在跑的模型与工具调用
  const failure = new AbortController();
  const abortSignal = AbortSignal.any([request.signal, failure.signal]);
  request.signal.addEventListener("abort", () =>
    console.info("[ai-analysis] client disconnected, aborting", symbol),
  );

  // 单个分析师：工具循环 + 结构化输出；每次调用工具时通过 onStep 通知前端
  // （schema 校验失败会抛错，由外层转成 SSE error）
  const runAgent = async (
    persona: AgentPersona,
    onStep: (tool: string) => void,
  ): Promise<AgentResult> => {
    const result = streamText({
      model: deepseek("deepseek-v4-flash"),
      tools: { getStockPrice, getFinancials, getNews },
      stopWhen: stepCountIs(5),
      abortSignal,
      system: `${PERSONA_PROMPTS[persona]}${langInstruction}`,
      prompt: ANALYSIS_PROMPT(symbol),
      output: Output.object({ schema: agentOutputSchema }),
    });
    for await (const part of result.fullStream) {
      if (part.type === "tool-call") onStep(part.toolName);
      else if (part.type === "error") throw part.error;
    }
    const output = await result.output;
    // 观察步数预算（stepCountIs(5)）是否够用：finishReason 不是 stop 说明被截断
    console.info(
      "[ai-analysis] agent finished",
      persona,
      await result.finishReason,
    );
    return { persona, ...output, score: Math.round(output.score) };
  };

  let streamClosed = false;
  const stream = new ReadableStream({
    async start(controller) {
      // 流已关闭（客户端断开）后 enqueue 会抛错，所以先判断并吞掉
      const send = (event: string, data: unknown) => {
        if (streamClosed) return;
        try {
          controller.enqueue(sseEvent(event, data));
        } catch {
          streamClosed = true;
        }
      };

      try {
        const [results, quote] = await Promise.all([
          Promise.all(
            personas.map((p, i) =>
              runAgent(p, (tool) => send("step", { persona: p, tool })).then(
                (r) => {
                  send(`agent${i + 1}_done`, r);
                  return r;
                },
              ),
            ),
          ),
          personas.length === 2
            ? yf.quote(symbol).catch((err) => {
                console.warn("[ai-analysis] quote failed", symbol, err);
                return null;
              })
            : null,
        ]);

        if (results.length === 2) {
          // 行情失败时明确告诉 coordinator 价格不可用，不能给它 $0 让它据此定区间
          const price = quote?.regularMarketPrice;
          const { output } = await generateText({
            model: deepseek("deepseek-v4-flash"),
            providerOptions: {
              deepseek: { thinking: { type: "disabled" } },
            },
            abortSignal,
            system: `${COORDINATOR_PROMPT}${langInstruction}`,
            prompt: `
      Current market price: ${price != null ? `$${price}` : "unavailable (anchor the range to the two agents' buy ranges instead)"}
      Agent 1 (${personas[0]}): ${JSON.stringify(results[0])}
      Agent 2 (${personas[1]}): ${JSON.stringify(results[1])}

      Synthesize these two perspectives and give your final recommendation for ${symbol}.`,
            output: Output.object({ schema: coordinatorOutputSchema }),
          });
          send("coordinator_done", {
            ...output,
            score: Math.round(output.score),
          });
        }
      } catch (err) {
        // 让还在跑的另一个 agent 一并停下
        failure.abort();
        if (request.signal.aborted) return; // 客户端已走，无需再通知
        // 原始错误只写服务端日志，前端只拿到通用错误
        console.error("[ai-analysis] Error:", err);
        send("error", {});
      } finally {
        if (!streamClosed) {
          streamClosed = true;
          try {
            controller.close();
          } catch {
            // 已被客户端取消
          }
        }
      }
    },
    cancel() {
      streamClosed = true;
      failure.abort();
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
