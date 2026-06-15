# DEVLOG — 开发日志

每次会话结束时记录当天做了什么。按日期倒序排列（最新在上）。

---

## 2026-06-15

**AI 分析页 SSE 流式推送（Task 2）**
- 将 `/api/ai-analysis` 从阻塞式 `Response.json()` 改为 SSE `ReadableStream`
- 两个 Agent 保持并行执行，各自完成后通过 `.then()` 即时 push SSE 事件
- 前端 `analysis-shell.tsx` 替换 `useMutation` 为手动 SSE fetch reader，卡片随事件逐张滑入
- 删除 `progress-steps.tsx`（假进度条组件）及 `runFakeProgress` 伪动画逻辑

**Harness 更新**
- `TASKS.md`：删除 Task 1（量化投资机构页），新增 Task 2（SSE 流式推送）
- `features/ai/ARCHITECTURE.md`：更新流程图、删除 ProgressSteps 组件引用、更新注意事项
- 新增 `GOTCHAS.md`（踩坑记录）
- 新增 `DEVLOG.md`（本文件）

**新增 Skill**
- `~/.claude/skills/feature-design/SKILL.md`：三阶段功能设计流程（grill-me → 视觉伴侣 → 更新 harness）
