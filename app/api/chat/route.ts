import { openrouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter("openrouter/free"),
    messages: await convertToModelMessages(messages),
    system:
      "You are a helpful AI investment assistant. Help users analyze their portfolio, market trends, and investment strategies. Be concise and clear.",
  });

  return result.toUIMessageStreamResponse();
}
