# CLAUDE.md

## 项目概览

**PortfolioX** — 面向个人投资者的 AI 驱动股票与加密货币投资组合管理平台。
技术栈：Next.js 16 + Supabase（Auth + DB）+ AI SDK（DeepSeek / OpenRouter / Tavily）。

## 首次运行

```bash
pnpm install
./init.sh        # 依次执行 build → lint → test，全部通过才算环境正常
```

详细的启动状态、项目结构和初始化验收清单见 [`INIT_CONTRACT.md`](INIT_CONTRACT.md)。

## 全局硬约束

1. **一次只做一个任务** — 从 `TASKS.md` 选一个任务，验收标准全部满足后再选下一个
2. **完成前必须跑 `./init.sh`** — 三项全过才能声称完成，不允许跳过
3. **不在客户端暴露密钥** — Supabase service key、AI API key 只在 server actions 中使用
4. **范围外文件不动** — 当前任务以外的文件，未经确认不得修改

完整约束（安全、Git、测试、i18n、数据完整性）见 [`CONSTRAINTS.md`](CONSTRAINTS.md)。

## 专题文档

| 文件                 | 描述                | 何时读                     |
| -------------------- | ------------------- | -------------------------- |
| `INIT_CONTRACT.md`   | 启动就绪清单        | 新会话第一件事             |
| `TASKS.md`           | 任务分解与验收标准  | 选任务时，完成任务时更新   |
| `feature_list.json`  | 功能状态与依赖关系  | 了解整体功能进度时         |
| `progress.md`        | 跨 session 进度日志 | 启动时了解现状，结束时更新 |
| `init.sh`            | 验证入口            | 开始前和声称完成前各跑一次 |
| `CONSTRAINTS.md`     | 完整硬约束清单      | 开始编码前确认无违规        |
| `features/*/ARCHITECTURE.md` | 各模块职责、接口与依赖 | 修改某个 feature 前阅读对应文件 |
| `GOTCHAS.md`         | 踩坑记录与注意事项  | 开始新功能开发前浏览一遍       |
| `DEVLOG.md`          | 每日开发日志        | 会话结束时追加当天内容         |
