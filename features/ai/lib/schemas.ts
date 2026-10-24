// AI 输出的 zod schema —— 传给 generateText 的 Output.object，由 SDK 校验模型返回
import { z } from "zod";

const buyRange = z.object({
  low: z.number().positive(),
  high: z.number().positive(),
});
const verdict = z.enum(["buy", "hold", "sell"]);
const score = z.number().int().min(0).max(100);

export const agentOutputSchema = z.object({
  points: z.array(z.string()).length(3),
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
