// 让单个分析师 persona 带着工具对 symbol 做一次分析，返回通过 schema 校验的结构化结果；模型输出不合格时抛错
import { model } from "@/lib/ai";
import { generateText, Output, stepCountIs } from "ai";
import { getStockPrice } from "@/features/ai/lib/getStockPrice";
import { getFinancials } from "@/features/ai/lib/getFinancials";
import { getNews } from "@/features/ai/lib/getNews";
import { ANALYSIS_PROMPT, PERSONA_PROMPTS } from "@/features/ai/lib/prompts";
import { personaOutputSchema } from "@/features/ai/lib/schemas";
import type { AgentPersona, AgentResult } from "@/features/ai/types";

export async function runPersona(
  persona: AgentPersona,
  symbol: string,
  langInstruction: string,
): Promise<AgentResult> {
  const { output } = await generateText({
    model,
    tools: { getStockPrice, getFinancials, getNews },
    output: Output.object({ schema: personaOutputSchema }),
    stopWhen: stepCountIs(5),
    system: `${PERSONA_PROMPTS[persona]}${langInstruction}`,
    prompt: ANALYSIS_PROMPT(symbol),
  });
  return { persona, ...output };
}
