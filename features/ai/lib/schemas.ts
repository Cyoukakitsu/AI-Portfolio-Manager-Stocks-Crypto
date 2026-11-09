// AI 的 zod schema：模型输出（传给 Output.object，由 SDK 校验）与路由入参（safeParse 校验）
import { z } from "zod";

/**
 * 投资大师派别，每个值对应一套不同的 system prompt 和分析风格
 * buffett 巴菲特：价值投资，护城河，长期持有
 * lynch 彼得·林奇：成长股，PEG，消费者洞察
 * wood 木头姐：颠覆式创新，TAM，5年期预测
 * burry 迈克尔·伯里：逆向思维，泡沫识别
 * dalio 瑞·达利欧：宏观周期，全球配置
 */
export const PERSONAS = ["buffett", "lynch", "wood", "burry", "dalio"] as const;

const buyRange = z.object({
  low: z.number().positive(),
  high: z.number().positive(),
});
const verdict = z.enum(["buy", "hold", "sell"]);
// 不要求整数：模型偶尔返回 68.5，整次分析失败不值得；展示前在路由里取整
const score = z.number().min(0).max(100);

export const agentOutputSchema = z.object({
  // prompt 要求 3 条，这里放宽到 1-5 条，多一条少一条不让整次分析失败
  points: z.array(z.string()).min(1).max(5),
  score,
  verdict,
  buyRange,
});

export const coordinatorOutputSchema = z.object({
  verdict,
  score,
  summary: z.string(),
  buyRange,
});

// POST /api/ai-analysis 的请求体
export const analysisRequestSchema = z.object({
  // 会拼进 prompt 并传给行情工具，所以限制字符集与长度（如 AAPL、BRK.B、BTC-USD、^GSPC、GC=F）
  symbol: z.string().regex(/^[A-Za-z0-9.\-=^]{1,15}$/),
  personas: z
    .array(z.enum(PERSONAS))
    .min(1)
    .max(2)
    .refine((list) => new Set(list).size === list.length, "duplicate persona"),
  locale: z.string().max(10).optional(),
});
