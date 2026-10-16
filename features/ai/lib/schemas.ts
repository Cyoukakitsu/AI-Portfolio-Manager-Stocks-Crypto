// LLM 输出的 zod schema：信任边界，模型返回不合格时 generateText 会抛错而不是放行
import { z } from "zod";

const buyRange = z.object({ low: z.number().positive(), high: z.number().positive() });
const verdict = z.enum(["buy", "hold", "sell"]);
const score = z.number().int().min(0).max(100);

export const personaOutputSchema = z.object({
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
