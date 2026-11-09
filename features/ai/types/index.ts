import type { z } from "zod";
import type {
  PERSONAS,
  agentOutputSchema,
  coordinatorOutputSchema,
} from "@/features/ai/lib/schemas";

/** 投资大师派别（取值与各自的风格说明见 `lib/schemas.ts` 的 `PERSONAS`） */
export type AgentPersona = (typeof PERSONAS)[number];

/** 分析结论方向 */
export type Verdict = "buy" | "hold" | "sell";

/** 买入价格区间 */
export type BuyRange = { low: number; high: number };

/** 单个 Agent 的分析结论：模型输出（schema 推导）加上是谁给出的 */
export type AgentResult = { persona: AgentPersona } & z.infer<
  typeof agentOutputSchema
>;

/** Coordinator 的综合结论（综合两位分析师的买入价格区间） */
export type CoordinatorResult = z.infer<typeof coordinatorOutputSchema>;

/**
 * 一次完整分析的结果
 * 前端展示 + 存入 Supabase 都用这个结构
 */
export type AnalysisResult = {
  symbol: string;
  agentResults: AgentResult[];
  coordinator: CoordinatorResult | null;
  analyzedAt: string; // ISO 时间字符串
};
