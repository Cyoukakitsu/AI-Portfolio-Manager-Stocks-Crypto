// app/api/chat/route.ts
import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "google/gemini-1.5-flash",

    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
