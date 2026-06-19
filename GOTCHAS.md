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

## [2026-06-15] 并行 Agent 改顺序执行导致总耗时翻倍

**场景**：为 AI 分析页实现 SSE 流式推送（Task 2），需要逐步推送每个 Agent 的结果

**现象**：最初设计为顺序执行 Agent1 → Agent2 → Coordinator，以便逐步 push SSE 事件。但这样总耗时从 ~15s 变成 ~25s（+10s）

**根因**：原代码用 `Promise.all` 并行跑两个 Agent，耗时取决于最慢的那个。改成顺序后变成两者相加

**注意**：SSE 流式推送不需要改变执行顺序。正确做法是保持 `Promise.all` 并行，对每个 Promise 附加 `.then()` 回调——谁先完成谁先 push 事件，总耗时不变，用户依然能看到卡片逐步出现
