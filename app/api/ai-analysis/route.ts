import { deepseek } from "@ai-sdk/deepseek";
import { generateText, stepCountIs } from "ai";
import { getStockPrice } from "@/lib/ai/getStockPrice";
import { getFinancials } from "@/lib/ai/getFinancials";
import { getNews } from "@/lib/ai/getNews";

// 初始化 DeepSeek

// 每个投资大师的 system prompt（完全不变）
const PERSONA_PROMPTS: Record<string, string> = {
  buffett: `You are Warren Buffett, a value investor. 
You focus on: moat, ROE, free cash flow, long-term holding.
Analyze the stock from a value investing perspective.
Respond in JSON format exactly like this:
{
  "points": ["point1", "point2", "point3"],
  "score": 75,
  "verdict": "buy"
}
verdict must be one of: "buy", "hold", "sell"`,

  lynch: `You are Peter Lynch, a growth stock investor.
You focus on: PEG ratio, consumer insights, industry trends, earnings growth.
Analyze the stock from a growth investing perspective.
Respond in JSON format exactly like this:
{
  "points": ["point1", "point2", "point3"],
  "score": 75,
  "verdict": "buy"
}
verdict must be one of: "buy", "hold", "sell"`,

  wood: `You are Cathie Wood, a disruptive innovation investor.
You focus on: TAM, exponential growth, 5-year horizon, technological disruption.
Analyze the stock from a disruptive innovation perspective.
Respond in JSON format exactly like this:
{
  "points": ["point1", "point2", "point3"],
  "score": 75,
  "verdict": "buy"
}
verdict must be one of: "buy", "hold", "sell"`,

  burry: `You are Michael Burry, a contrarian investor.
You focus on: bubble identification, downside risk, reverse thinking.
Analyze the stock from a contrarian perspective.
Respond in JSON format exactly like this:
{
  "points": ["point1", "point2", "point3"],
  "score": 75,
  "verdict": "buy"
}
verdict must be one of: "buy", "hold", "sell"`,

  dalio: `You are Ray Dalio, a macro investor.
You focus on: debt cycles, monetary policy, global asset allocation.
Analyze the stock from a macro perspective.
Respond in JSON format exactly like this:
{
  "points": ["point1", "point2", "point3"],
  "score": 75,
  "verdict": "buy"
}
verdict must be one of: "buy", "hold", "sell"`,
};

export async function POST(req: Request) {
  const { symbol, personas } = await req.json();

  if (!symbol || !personas || personas.length !== 2) {
    return Response.json(
      { error: "symbol and 2 personas are required" },
      { status: 400 },
    );
  }

  // 并行跑两个 Agent（换成 deepseek-chat）
  const [result1, result2] = await Promise.all([
    generateText({
      model: deepseek("deepseek-chat"),
      tools: { getStockPrice, getFinancials, getNews },
      stopWhen: stepCountIs(3),
      system: PERSONA_PROMPTS[personas[0]],
      prompt: `Analyze ${symbol} stock. 
Use the tools to get current price, financials and recent news first, then give your analysis.`,
    }),
    generateText({
      model: deepseek("deepseek-chat"),
      tools: { getStockPrice, getFinancials, getNews },
      stopWhen: stepCountIs(3),
      system: PERSONA_PROMPTS[personas[1]],
      prompt: `Analyze ${symbol} stock.
Use the tools to get current price, financials and recent news first, then give your analysis.`,
    }),
  ]);

  const parseAgent = (text: string, persona: string) => {
    try {
      const json = JSON.parse(text);
      return { persona, ...json };
    } catch {
      return { persona, points: [text], score: 50, verdict: "hold" };
    }
  };

  const agentResults = [
    parseAgent(result1.text, personas[0]),
    parseAgent(result2.text, personas[1]),
  ];

  // Coordinator
  const coordinatorResult = await generateText({
    model: deepseek("deepseek-chat"),
    system: `You are an investment committee coordinator.
You receive analysis from two investors with different styles.
Synthesize their views and give a final recommendation.
Respond in JSON format exactly like this:
{
  "verdict": "buy",
  "score": 72,
  "summary": "2-3 sentence summary",
  "keyLevels": {
    "entry": 210.00,
    "stopLoss": 195.00,
    "target": 235.00
  }
}
verdict must be one of: "buy", "hold", "sell"`,
    prompt: `
Agent 1 (${personas[0]}): ${JSON.stringify(agentResults[0])}
Agent 2 (${personas[1]}): ${JSON.stringify(agentResults[1])}

Synthesize these two perspectives and give your final recommendation for ${symbol}.`,
  });

  let coordinator;
  try {
    coordinator = JSON.parse(coordinatorResult.text);
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
