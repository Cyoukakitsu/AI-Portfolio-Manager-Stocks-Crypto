import { describe, it, expect } from "vitest";
import { agentOutputSchema, coordinatorOutputSchema } from "../schemas";

const agent = {
  points: ["a", "b", "c"],
  score: 68,
  verdict: "hold",
  buyRange: { low: 195, high: 210 },
};

describe("agentOutputSchema", () => {
  it("合法输入通过", () => {
    expect(agentOutputSchema.safeParse(agent).success).toBe(true);
  });
  it.each([
    ["非法 verdict", { ...agent, verdict: "maybe" }],
    ["score 越界", { ...agent, score: 101 }],
    ["buyRange 为 0", { ...agent, buyRange: { low: 0, high: 0 } }],
    ["points 不是 3 条", { ...agent, points: ["a"] }],
  ])("拒绝：%s", (_, bad) => {
    expect(agentOutputSchema.safeParse(bad).success).toBe(false);
  });
});

describe("coordinatorOutputSchema", () => {
  it("合法输入通过，缺 summary 被拒", () => {
    const ok = {
      verdict: "buy",
      score: 70,
      summary: "s",
      buyRange: agent.buyRange,
    };
    expect(coordinatorOutputSchema.safeParse(ok).success).toBe(true);
    const { summary, ...rest } = ok;
    void summary;
    expect(coordinatorOutputSchema.safeParse(rest).success).toBe(false);
  });
});
