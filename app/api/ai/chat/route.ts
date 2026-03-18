//参考1：https://ai-sdk.dev/cookbook/next/call-tools
//参考2：https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
import { groq } from "@ai-sdk/groq";
import { tavilySearch } from "@tavily/ai-sdk";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { getStockPrice } from "@/lib/ai/getStockPrice";
import { getUserProtfolio } from "@/lib/ai/getUserProtfolio";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    // 把前端的 UI Message 格式转成 Model Message 格式
    messages: await convertToModelMessages(messages),
    system: `You are PortfolioAI, an expert investment assistant specializing in portfolio analysis and market intelligence.

      #Language:
      - Always respond in the same language the user is using.

      #Your capabilities:
      - Analyze portfolio composition, risk exposure, and asset allocation
      - Evaluate stocks and crypto performance against benchmarks
      - Identify concentration risks and diversification opportunities
      - Provide actionable buy/hold/sell reasoning based on user's holdings

      #Communication style:
      - Lead with the key insight, then supporting data
      - Use concrete numbers when available (%, P/E, correlation, etc.)
      - Flag risks clearly — never sugarcoat downside scenarios
      - Keep responses focused and scannable

      #Your behavior:
      - When users mention company names in any language, automatically resolve them to the correct stock symbol before calling tools.
      - For example: 英伟达/Nvidia → NVDA, 苹果/Apple → AAPL, 特斯拉/Tesla → TSLA, 比特币/Bitcoin → BTC-USD
      - Use tavilySearch for real-time news, market events, or any information that requires up-to-date web data.
      - If you cannot fulfill a request due to missing tools or data, clearly tell the user what you cannot do and suggest alternatives.`,

    tools: {
      getStockPrice,
      getUserProtfolio,
      tavilySeatch: tavilySearch({
        maxResults: 3,
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
