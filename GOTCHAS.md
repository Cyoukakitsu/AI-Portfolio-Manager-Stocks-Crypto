# GOTCHAS — 踩坑记录

开发过程中遇到的 bug、AI 行为异常、出人意料的 edge case。
新功能开发前先浏览，避免重复踩坑。

---

## 格式

```
## [YYYY-MM-DD] 问题标题
**场景**：在做什么时遇到
**现象**：出了什么问题
**根因**：为什么会这样
**注意**：下次做类似功能时要留意什么
```

---

## [2026-06-19] react-markdown 默认不渲染 GFM 表格

**场景**：AI Summary prompt 要求输出 Markdown 表格，前端用 `ReactMarkdown` 渲染

**现象**：表格以原始文本 `| col | col |` 形式显示，不是 HTML 表格

**根因**：`react-markdown` v10+ 默认只支持 CommonMark，GFM（GitHub Flavored Markdown）表格需要插件

**注意**：安装 `remark-gfm`，并传入 `<ReactMarkdown remarkPlugins={[remarkGfm]}>`

---

## [2026-06-19] Promise.allSettled + yahoo-finance2 类型推断为 never

**场景**：在 API route 中用 `Promise.allSettled` 并行 fetch 多个 symbol 的报价

**现象**：`quotes[i].value.regularMarketPrice` 报 TypeScript 错误：`Property 'regularMarketPrice' does not exist on type 'never'`

**根因**：`yahoo-finance2` 的 `quote()` 有多个泛型重载，`Promise.allSettled` 的类型推断无法正确 narrow，`.value` 被推断为 `never`

**注意**：改用 per-item `async/await + try/catch` 代替 `Promise.allSettled`，类型推断正常

---

## [2026-06-19] System prompt 语言影响模型输出语言

**场景**：Portfolio AI Summary prompt 中分区标题写成中文（`## 持仓快照`），locale 为 `ja`

**现象**：模型忽略 locale 指令，全程输出中文

**根因**：免费模型优先跟随 system prompt 中的语言风格，而非语言指令

**注意**：system prompt 的结构标题统一用英文（`## HOLDINGS SNAPSHOT`），locale 指令加 `CRITICAL:` 前缀并明确说明语言代码含义

---

## [2026-06-20] Tavily fetch 两头实现行为不一致

**场景**：`getNews.ts`（AI tool）和 `news/route.ts` 各自直接 fetch Tavily API

**现象**：`getNews.ts` 无超时保护、缺 key 静默返回 `[]`；`news/route.ts` 有 5s AbortController、缺 key 抛 500。修一处，另一处仍是旧行为

**根因**：同一个 HTTP 操作复制了两份，参数和错误处理策略各自演化

**注意**：统一通过 `lib/news-fetcher.ts` 的 `fetchNews(query, { maxResults, timeoutMs })` 调用，超时和 key 检查只在一处维护

---

## [2026-06-20] YahooFinance 多处实例化导致连接资源浪费

**场景**：yahoo-finance2 被多个 API route 和 AI 工具函数各自 import 并 `new YahooFinance()`

**现象**：每个模块独立持有实例，cookie jar / crumb 缓存无法复用，请求数翻倍

**根因**：yahoo-finance2 在每个 `new YahooFinance()` 时会各自维护独立的 cookie jar 和 crumb，同一进程多实例等于重复握手

**注意**：统一通过 `lib/yahoo-finance.ts` 导出单例，所有路由和工具函数 `import yf from "@/lib/yahoo-finance"` 即可，禁止再各自 new

---

## [2026-06-20] locale 注入机制在两条 AI 路由中分叉

**场景**：`ai-analysis/route.ts` 和 `assets/ai-summary/route.ts` 都需要向 LLM 注入语言指令

**现象**：两条路由各自实现：一个硬判 `locale === "ja"`（英文不注入），另一个直接把 locale 字符串拼进 prompt

**根因**：没有共享的语言指令构建函数，新增语言需要同时改多处，且两种风格的指令措辞不一致

**注意**：统一使用 `lib/lang-instruction.ts` 的 `buildLangInstruction(locale)`，新增语言只改 `LOCALE_NAMES` 映射表

---

## [2026-06-15] 并行 Agent 改顺序执行导致总耗时翻倍

**场景**：为 AI 分析页实现 SSE 流式推送（Task 2），需要逐步推送每个 Agent 的结果

**现象**：最初设计为顺序执行 Agent1 → Agent2 → Coordinator，以便逐步 push SSE 事件。但这样总耗时从 ~15s 变成 ~25s（+10s）

**根因**：原代码用 `Promise.all` 并行跑两个 Agent，耗时取决于最慢的那个。改成顺序后变成两者相加

**注意**：SSE 流式推送不需要改变执行顺序。正确做法是保持 `Promise.all` 并行，对每个 Promise 附加 `.then()` 回调——谁先完成谁先 push 事件，总耗时不变，用户依然能看到卡片逐步出现
