// 全站唯一的 LLM 配置入口（见 docs/adr/0001-unify-on-deepseek.md）
import { deepseek } from "@ai-sdk/deepseek";

export const model = deepseek("deepseek-v4-flash");

// 关闭思考模式：需要更低延迟、输出稳定 JSON 的调用使用
export const noThinking = {
  deepseek: { thinking: { type: "disabled" } },
} as const;
