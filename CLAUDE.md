# CLAUDE.md

## 项目概览

**PortfolioX** — 面向个人投资者的 AI 驱动股票与加密货币投资组合管理平台。
技术栈：Next.js 16 + Supabase（Auth + DB）+ AI SDK（DeepSeek / Tavily）。

## 首次运行

```bash
pnpm install
./init.sh        # 依次执行 build → lint → test，全部通过才算环境正常
```

常用命令：`pnpm dev` 启动开发服务器，`pnpm test` 跑单元测试，`pnpm test:e2e` 跑 Playwright E2E，`./init.sh` 完整验证。

目录：`app/` 路由；`features/` 按功能垂直拆分（auth / assets / stocks / crypto / dashboard / hero / ai）；`components/` 跨功能 UI；`lib/` 共享工具与外部服务封装；`messages/` i18n 文案。

## 全局硬约束

1. **一次只做一个任务** — 从 `TASKS.md` 选一个任务，完成条件全部满足后再选下一个；新想法记入其 Inbox，不打断当前任务
2. **完成前必须跑 `./init.sh`** — 三项全过才能声称完成，不允许跳过
3. **不在客户端暴露密钥** — Supabase service key、AI API key 只在服务端（server actions / route handler）中使用；数据读写默认走 server actions，仅 SSE 与 AI 流式接口用 route handler
4. **范围外文件不动** — 当前任务以外的文件，未经确认不得修改

完整约束（安全、Git、测试、i18n、数据完整性）见 [`CONSTRAINTS.md`](CONSTRAINTS.md)。

## 专题文档

| 文件                 | 描述                | 何时读                     |
| -------------------- | ------------------- | -------------------------- |
| `TASKS.md`           | 唯一任务清单（含 Inbox、变更记录） | 新会话第一件事；完成任务时更新 |
| `CONTEXT.md`         | 领域术语表          | 命名、写提示词与文档前读   |
| `docs/adr/`          | 架构决策记录        | 想改动已定技术选型前读     |
| `init.sh`            | 验证入口            | 开始前和声称完成前各跑一次 |
| `CONSTRAINTS.md`     | 完整硬约束清单      | 开始编码前确认无违规        |
| `features/*/ARCHITECTURE.md` | 各模块职责、接口与依赖 | 修改某个 feature 前阅读对应文件 |
| `lib/ARCHITECTURE.md`        | 共享工具层职责与使用约定 | 新增或修改 `lib/` 下文件前阅读 |
| `GOTCHAS.md`         | 踩坑记录与注意事项  | 开始新功能开发前浏览一遍       |
