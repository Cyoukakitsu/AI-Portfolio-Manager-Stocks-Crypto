# AI 统一使用 DeepSeek

所有 AI 调用（Persona 分析、Committee Verdict、Portfolio Summary）统一使用 DeepSeek，模型配置集中在 `lib/ai.ts`，移除 OpenRouter 与 Groq 依赖。
原因：只维护一个 API key，模型行为可预期；此前 Portfolio Summary 用的 `openrouter/free` 是免费路由，实际模型不固定，输出质量不可控。
代价：没有备选模型，DeepSeek 不可用时 AI 功能整体失效；如需恢复多提供商，只需改 `lib/ai.ts`。
