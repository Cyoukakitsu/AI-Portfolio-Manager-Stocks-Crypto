// 日期工具函数

export type Range = "1M" | "6M" | "1Y" | "YTD" | "MAX";

// 根据时间范围计算起始日期
export function getFromDate(range: Range, firstTransactionDate?: string): string {
  const now = new Date();

  if (range === "YTD") {
    return `${now.getFullYear()}-01-01`;
  }

  if (range === "MAX") {
    // 使用最早交易日，若无则默认 2020-01-01
    return firstTransactionDate ?? "2020-01-01";
  }

  const daysMap: Record<Range, number> = {
    "1M": 30,
    "6M": 180,
    "1Y": 365,
    YTD: 0,
    MAX: 0,
  };

  const from = new Date(now.getTime() - daysMap[range] * 24 * 60 * 60 * 1000);
  return from.toISOString().split("T")[0];
}

// 将 ISO 日期字符串转换为「X秒/分/時/日前」格式
export function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}
