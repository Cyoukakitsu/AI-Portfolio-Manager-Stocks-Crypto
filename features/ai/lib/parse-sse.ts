// 解析一个完整的 SSE 事件块（两个换行之间的文本）。
// 没有 event 或 data、或 data 不是合法 JSON 时返回 null，由调用方忽略。
export function parseSseEvent(
  block: string,
): { event: string; data: unknown } | null {
  let event = "";
  let dataLine = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7).trim();
    else if (line.startsWith("data: ")) dataLine = line.slice(6);
  }
  if (!event || !dataLine) return null;
  try {
    return { event, data: JSON.parse(dataLine) };
  } catch {
    return null;
  }
}
