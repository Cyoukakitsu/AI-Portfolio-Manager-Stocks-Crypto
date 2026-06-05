# 初始化契约

新会话启动时先读本文件，确认环境就绪后再查看 `TASKS.md` 选任务。

## 启动命令

| 用途 | 命令 |
|---|---|
| 安装依赖 | `pnpm install` |
| 启动开发服务器 | `pnpm dev` |
| 运行测试 | `pnpm test` |
| 完整验证（build + lint + test） | `./init.sh` |

## 当前状态

- 所有依赖已安装并锁定（`pnpm-lock.yaml`）
- 测试框架已配置（Vitest）；示例测试通过（6/6，`features/assets/lib/__tests__/calculations.test.ts`）
- Lint 已配置（ESLint）
- TypeScript 严格模式已配置
- CI 已配置（GitHub Actions，PR 时自动运行 vitest）

## 项目结构

```
/
├── app/              — Next.js App Router 页面与路由
├── features/         — 按功能垂直拆分的业务模块
│   ├── auth/         — 认证（Supabase）
│   ├── assets/       — 资产持仓管理
│   ├── stocks/       — 股票行情展示
│   ├── crypto/       — 加密货币行情展示
│   ├── dashboard/    — 全局 UI 骨架（侧边栏、Header）
│   ├── hero/         — 公开落地页
│   └── ai/           — AI 多角色投资分析
├── components/       — 跨功能通用 UI 组件
├── lib/              — 通用工具函数
├── messages/         — i18n 翻译文件（中/英/日）
└── docs/specs/       — 功能规格与设计文档
```

## 初始化验收清单

- [x] `pnpm install` 从零开始能成功
- [x] `pnpm test` 至少有一个测试通过（当前 6/6）
- [x] 新会话只看仓库能回答"怎么跑"和"怎么测"
- [x] 任务分解文件存在且有至少 3 个任务（见 `TASKS.md`）
- [x] 所有内容已提交到 git
