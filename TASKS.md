# 任务分解

每次只做一个任务。完成验收标准后更新 `progress.md` 和 `feature_list.json`，再选下一个任务。

---

## Task 2：AI 分析页 SSE 流式推送

**目标**：将 `/api/ai-analysis` 从阻塞式 JSON 改为 SSE 流，Agent 结果逐张滑入，删除 `ProgressSteps` 假进度条。

**背景**
当前双 Agent 模式需等待全部完成（约 15 秒）才一次性渲染。改为 SSE 后，两个 Agent 仍然并行执行，哪个先完成哪张卡片先滑入，总耗时不变但第一张卡约 10 秒即可出现。设计文档：`docs/superpowers/specs/2026-06-15-ai-analysis-sse-streaming-design.md`

**范围文件**
- `app/api/ai-analysis/route.ts` — 改为 SSE ReadableStream，顺序执行 Agent，逐步 push 事件
- `features/ai/components/analysis-shell.tsx` — 替换 useMutation 为手动 SSE fetch reader，删除 ProgressSteps 相关代码
- `features/ai/components/progress-steps.tsx` — **整个文件删除**

**SSE 事件协议**
```
event: agent1_done / agent2_done  →  AgentResult JSON（并行执行，谁先完成谁先推）
event: coordinator_done           →  CoordinatorResult JSON（两个 agent 都完成后才启动）
event: error                      →  { message: string }
```

**验收标准**
- [x] `pnpm build` 通过，无类型错误
- [x] 选 1 个 Agent：约 10 秒后卡片带 fade-in 动画出现
- [x] 选 2 个 Agent：第一张卡片先出现，第二张随后滑入，最后 Coordinator 卡片出现
- [x] `ProgressSteps` 组件已删除，`runFakeProgress` 逻辑已删除
- [x] 用户中途关闭页面 / 重新分析可正确中止上一次请求（AbortController）
- [x] 分析失败时 `toast.error` 正常弹出

**✅ 完成于 2026-06-15**

