"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新消息到来时自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-6">
      <motion.h1
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" as const }}
      >
        AI Investment Assistant
      </motion.h1>

      <div className="flex-1 overflow-y-auto space-y-6 mb-8 border border-border rounded-3xl p-6">
        {/* 空状态 */}
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              key="empty"
              className="text-center text-muted-foreground mt-20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              Hello! I am your AI investment assistant, and I can help you
              analyze market trends, investment portfolios, and conduct risk
              assessments.
            </motion.div>
          )}
        </AnimatePresence>

        {/* 消息列表 */}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" as const }}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-5 py-3 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.parts.map((part, i) =>
                  part.type === "text" ? <div key={i}>{part.text}</div> : null,
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 流式输出中的打字指示器 */}
        <AnimatePresence>
          {status === "submitted" && (
            <motion.div
              key="typing"
              className="flex justify-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-muted rounded-3xl px-5 py-3 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut" as const,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
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
          className="rounded-3xl px-8 text-lg cursor-pointer"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
