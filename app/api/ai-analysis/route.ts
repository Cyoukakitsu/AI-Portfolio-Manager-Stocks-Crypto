//接收前端传的「股票代码 + 投资大师人设」
// 调用大模型 + 工具分析，返回结构化分析结果

import { deepseek } from "@ai-sdk/deepseek";
import { generateText, stepCountIs } from "ai";
import YahooFinance from "yahoo-finance2";
import { AgentPersona, AnalysisResult } from "@/features/ai/types";

import { getStockPrice } from "@/features/ai/lib/getStockPrice";
import { getFinancials } from "@/features/ai/lib/getFinancials";
import { getNews } from "@/features/ai/lib/getNews";
import { cleanJSON, parseAgent } from "@/features/ai/lib/parse-agent";
import {
  ANALYSIS_PROMPT,
  COORDINATOR_PROMPT,
  PERSONA_PROMPTS,
} from "@/features/ai/lib/prompts";

export async function POST(request: Request) {
  try {
    //从请求到响应的全流程处理

    //1. 入参接收 & 校验
    //用户选择的symbol（股票）和两个投资大师
    const {
      symbol,
      personas,
      locale,
    }: { symbol: string; personas: AgentPersona[]; locale?: string } =
      await request.json();

    // Agent回答（多语言指令）
    const langInstruction =
      locale === "ja"
        ? "\n\nIMPORTANT: Write all text content (points, summary) in Japanese. Numbers and proper nouns (stock symbols, company names) remain in their original form."
        : "";

    // 校验数据
    if (!symbol || !personas || personas.length < 1 || personas.length > 2) {
      return Response.json(
        { error: "symbol and 1 or 2 personas are required" },
        { status: 400 },
      );
    }

    // 2. 分支 1：仅选 1 个人设 → 单 Agent 分析
    if (personas.length === 1) {
      const result = await generateText({
        // generateText：文本生成函数，接受前端请求，与LLM模型api通信
        model: deepseek("deepseek-reasoner"), // 调用DeepSeek推理模型
        tools: { getStockPrice, getFinancials, getNews }, // 大模型可调用的工具（查股价/财报/新闻）
        stopWhen: stepCountIs(5), // 大模型思考步数上限（防止无限推理）
        system: `${PERSONA_PROMPTS[personas[0]]}${langInstruction}`, //设定 AI 的角色、性格、行为规则
        prompt: ANALYSIS_PROMPT(symbol), // 给 AI 的指令
      });

      const agentResults = [parseAgent(result.text, personas[0])]; // 解析大模型返回的文本为结构化数据

      const response: AnalysisResult = {
        symbol,
        agentResults,
        coordinator: null, // 只有1个 Agent，没有 Coordinator
        analyzedAt: new Date().toISOString(), //记录分析时间
      };

      return Response.json(response);
    }

    // 3. 分支 2：选 2 个人设 → 双 Agent + 实时股价 并行获取
    const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
    const [result1, result2, quote] = await Promise.all([
      generateText({
        model: deepseek("deepseek-reasoner"),
        tools: { getStockPrice, getFinancials, getNews },
        stopWhen: stepCountIs(5),
        system: `${PERSONA_PROMPTS[personas[0]]}${langInstruction}`,
        prompt: ANALYSIS_PROMPT(symbol),
      }),
      generateText({
        model: deepseek("deepseek-reasoner"),
        tools: { getStockPrice, getFinancials, getNews },
        stopWhen: stepCountIs(5),
        system: `${PERSONA_PROMPTS[personas[1]]}${langInstruction}`,
        prompt: ANALYSIS_PROMPT(symbol),
      }),
      // 获取股票的实时价格，使用 .catch(() => null) 处理可能的错误
      yf.quote(symbol).catch(() => null),
    ]);

    //regularMarketPrice是Yahoo Finance API 的返回值（当前股价）
    const currentPrice = quote?.regularMarketPrice ?? 0;
    const agentResults = [
      parseAgent(result1.text, personas[0]),
      parseAgent(result2.text, personas[1]),
    ];

    // 总结：最终决策
    const coordinatorResult = await generateText({
      model: deepseek("deepseek-chat"), //Coordinator 不需要深度推理，所以使用chat模式
      system: `${COORDINATOR_PROMPT}${langInstruction}`,

      //告诉 Coordinator 当前真实股价，防止用训练数据里的旧价格
      prompt: `
      Current market price: $${currentPrice} 
      Agent 1 (${personas[0]}): ${JSON.stringify(agentResults[0])}
      Agent 2 (${personas[1]}): ${JSON.stringify(agentResults[1])}

      Synthesize these two perspectives and give your final recommendation for ${symbol}.`,
    });

    //解析 Coordinator 的结果
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

    const response: AnalysisResult = {
      symbol,
      agentResults,
      coordinator,
      analyzedAt: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai-analysis] Error:", message, err);
    return Response.json({ error: message }, { status: 500 });
  }
}
