// 未登录访问任何 /api/* 都必须返回 401（任务 0.5），且不会触达 AI / 行情 / 新闻服务
import { expect, test } from "@playwright/test";

const routes: [string, string][] = [
  ["POST", "/api/ai-analysis"],
  ["POST", "/api/assets/ai-summary"],
  ["GET", "/api/assets/news?symbols=AAPL"],
  ["GET", "/api/yahoofinance/quote?symbol=AAPL"],
  ["GET", "/api/yahoofinance/history?symbol=AAPL"],
  ["GET", "/api/yahoofinance/search?q=apple"],
];

for (const [method, url] of routes) {
  test(`未登录 ${method} ${url} 返回 401`, async ({ request }) => {
    const res = await request.fetch(url, { method, data: method === "POST" ? {} : undefined });
    expect(res.status()).toBe(401);
  });
}
