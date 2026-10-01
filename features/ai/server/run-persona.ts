// 让单个分析师 persona 带着工具对 symbol 做一次分析，返回模型原始文本
import { deepseek } from "@ai-sdk/deepseek";
import { generateText, stepCountIs } from "ai";
import { getStockPrice } from "@/features/ai/lib/getStockPrice";
import { getFinancials } from "@/features/ai/lib/getFinancials";
import { getNews } from "@/features/ai/lib/getNews";
import { ANALYSIS_PROMPT, PERSONA_PROMPTS } from "@/features/ai/lib/prompts";
import type { AgentPersona } from "@/features/ai/types";

export async function runPersona(
  persona: AgentPersona,
  symbol: string,
  langInstruction: string,
) {
  const { text } = await generateText({
    model: deepseek("deepseek-v4-flash"),
    tools: { getStockPrice, getFinancials, getNews },
    stopWhen: stepCountIs(5),
    system: `${PERSONA_PROMPTS[persona]}${langInstruction}`,
    prompt: ANALYSIS_PROMPT(symbol),
  });
  return text;
}
