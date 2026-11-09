import { describe, it, expect } from "vitest";
import { parseSseEvent } from "../parse-sse";

describe("parseSseEvent", () => {
  it("解析完整事件", () => {
    expect(
      parseSseEvent(
        'event: step\ndata: {"persona":"buffett","tool":"getNews"}',
      ),
    ).toEqual({
      event: "step",
      data: { persona: "buffett", tool: "getNews" },
    });
  });
  it.each([
    ["缺 data", "event: step"],
    ["缺 event", 'data: {"a":1}'],
    ["data 不是合法 JSON", "event: step\ndata: {oops"],
    ["空块", ""],
  ])("返回 null：%s", (_, block) => {
    expect(parseSseEvent(block)).toBeNull();
  });
  it("按空行切分后，event 与 data 被拆在两个 chunk 里也不丢", () => {
    // 模拟前端的缓冲逻辑：chunk 在 event 行之后断开
    let buffer = "";
    const out: unknown[] = [];
    for (const chunk of ["event: agent1_done\n", 'data: {"score":70}\n\n']) {
      buffer += chunk;
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";
      for (const b of blocks) out.push(parseSseEvent(b));
    }
    expect(out).toEqual([{ event: "agent1_done", data: { score: 70 } }]);
  });
});
