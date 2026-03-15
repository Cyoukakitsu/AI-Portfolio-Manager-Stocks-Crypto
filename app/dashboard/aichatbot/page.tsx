"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        AI Investment Assistant
      </h1>

      <div className="flex-1 overflow-y-auto space-y-6 mb-8 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 mt-20">
            👋 Hello! I am your AI investment assistant, and I can help you
            analyze market trends, investment portfolios, and conduct risk
            assessments.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-3xl px-5 py-3 ${
                m.role === "user"
                  ? "bg-black text-white"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {m.parts.map((part, i) =>
                part.type === "text" ? <div key={i}>{part.text}</div> : null,
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="flex gap-3"
      >
        <Input
          className="flex-1 rounded-3xl px-6 py-4 text-lg"
          value={input}
          placeholder="Ask me anything..."
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-3xl px-8 text-lg"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
