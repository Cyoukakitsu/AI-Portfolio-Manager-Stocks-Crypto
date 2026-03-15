import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    // 把前端的 UI Message 格式转成 Model Message 格式
    messages: await convertToModelMessages(messages),
    system:
      "You are a helpful AI investment assistant. Help users analyze their portfolio, market trends, and investment strategies. Be concise and clear.",
  });

  return result.toUIMessageStreamResponse();
}
