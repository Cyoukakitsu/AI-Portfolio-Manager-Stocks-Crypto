// 让单个分析师 persona 带着工具对 symbol 做一次分析，返回通过 schema 校验的结构化结果；模型输出不合格时抛错
import { model } from "@/lib/ai";
import { generateText, Output, stepCountIs } from "ai";
import { getStockPrice } from "@/features/ai/lib/get-stock-price";
import { getFinancials } from "@/features/ai/lib/get-financials";
import { getNews } from "@/features/ai/lib/get-news";
import { ANALYSIS_PROMPT, PERSONA_PROMPTS } from "@/features/ai/lib/prompts";
import { personaAnalysisSchema } from "@/features/ai/lib/schemas";
import type { Persona, PersonaAnalysis } from "@/features/ai/types";

export async function runPersona(
  persona: Persona,
  symbol: string,
  langInstruction: string,
  abortSignal: AbortSignal,
): Promise<PersonaAnalysis> {
  const { output } = await generateText({
    model,
    tools: { getStockPrice, getFinancials, getNews },
    output: Output.object({ schema: personaAnalysisSchema }),
    stopWhen: stepCountIs(5),
    abortSignal,
    timeout: { totalMs: 90_000, stepMs: 30_000 },
    system: `${PERSONA_PROMPTS[persona]}${langInstruction}`,
    prompt: ANALYSIS_PROMPT(symbol),
  });
  return { persona, ...output };
}
