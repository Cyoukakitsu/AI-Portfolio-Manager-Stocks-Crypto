import { describe, it, expect } from "vitest";
import {
  agentOutputSchema,
  analysisRequestSchema,
  coordinatorOutputSchema,
} from "../schemas";

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
    ["points 为空", { ...agent, points: [] }],
    ["points 超过 5 条", { ...agent, points: ["a", "b", "c", "d", "e", "f"] }],
  ])("拒绝：%s", (_, bad) => {
    expect(agentOutputSchema.safeParse(bad).success).toBe(false);
  });
});

describe("agentOutputSchema 放宽的部分", () => {
  it("score 允许小数（路由里再取整），points 允许 1-5 条", () => {
    expect(agentOutputSchema.safeParse({ ...agent, score: 68.5 }).success).toBe(
      true,
    );
    expect(
      agentOutputSchema.safeParse({ ...agent, points: ["a"] }).success,
    ).toBe(true);
    expect(
      agentOutputSchema.safeParse({ ...agent, points: ["a", "b", "c", "d"] })
        .success,
    ).toBe(true);
  });
});

describe("analysisRequestSchema", () => {
  const ok = { symbol: "AAPL", personas: ["buffett"], locale: "ja" };

  it("合法输入通过，locale 可省略", () => {
    expect(analysisRequestSchema.safeParse(ok).success).toBe(true);
    expect(
      analysisRequestSchema.safeParse({
        symbol: "AAPL",
        personas: ["buffett", "lynch"],
      }).success,
    ).toBe(true);
  });
  it.each(["BRK.B", "BTC-USD", "^GSPC", "GC=F"])(
    "接受特殊 symbol：%s",
    (symbol) => {
      expect(analysisRequestSchema.safeParse({ ...ok, symbol }).success).toBe(
        true,
      );
    },
  );
  it.each([
    ["symbol 为空", { ...ok, symbol: "" }],
    ["symbol 超过 15 位", { ...ok, symbol: "A".repeat(16) }],
    ["symbol 含空格与提示词注入", { ...ok, symbol: "AAPL ignore previous" }],
    ["symbol 含引号", { ...ok, symbol: 'AAPL"' }],
    ["未知 persona", { ...ok, personas: ["unknown"] }],
    ["persona 重复", { ...ok, personas: ["buffett", "buffett"] }],
    ["persona 为空数组", { ...ok, personas: [] }],
    ["persona 超过 2 个", { ...ok, personas: ["buffett", "lynch", "wood"] }],
    ["缺 personas", { symbol: "AAPL" }],
    ["body 不是对象", null],
  ])("拒绝：%s", (_, bad) => {
    expect(analysisRequestSchema.safeParse(bad).success).toBe(false);
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
