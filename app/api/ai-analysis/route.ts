import { deepseek } from "@ai-sdk/deepseek";
import { generateText, stepCountIs } from "ai";

import { getStockPrice } from "@/lib/ai/getStockPrice";
import { getFinancials } from "@/lib/ai/getFinancials";
import { getNews } from "@/lib/ai/getNews";
import { cleanJSON, parseAgent } from "@/lib/ai/parse-agent";
import {
  ANALYSIS_PROMPT,
  COORDINATOR_PROMPT,
  PERSONA_PROMPTS,
} from "@/lib/ai/prompts";

//接收前端请求的入口
export async function POST(requset: Request) {
  //用户选择的symbol（股票）和两个投资大师
  const { symbol, personas } = await requset.json();

  if (!symbol || !personas || personas.length !== 2) {
    return Response.json(
      { error: "symbol and 2 personas are required" },
      { status: 400 },
    );
  }

  // 并行跑两个 Agent
  const [result1, result2] = await Promise.all([
    generateText({
      model: deepseek("deepseek-chat"),
      tools: { getStockPrice, getFinancials, getNews },
      // stepCountIs: 创建停止条件，当步数达到指定计数时停止
      stopWhen: stepCountIs(5),
      system: PERSONA_PROMPTS[personas[0]],
      prompt: ANALYSIS_PROMPT(symbol),
    }),
    generateText({
      model: deepseek("deepseek-chat"),
      tools: { getStockPrice, getFinancials, getNews },
      stopWhen: stepCountIs(5),
      system: PERSONA_PROMPTS[personas[1]],
      prompt: ANALYSIS_PROMPT(symbol),
    }),
  ]);

  const agentResults = [
    parseAgent(result1.text, personas[0]),
    parseAgent(result2.text, personas[1]),
  ];

  // 总结：最终决策
  const coordinatorResult = await generateText({
    model: deepseek("deepseek-chat"),
    system: COORDINATOR_PROMPT,
    prompt: `
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
      keyLevels: { entry: 0, stopLoss: 0, target: 0 },
    };
  }

  return Response.json({
    symbol,
    agentResults,
    coordinator,
    analyzedAt: new Date().toISOString(),
  });
}
