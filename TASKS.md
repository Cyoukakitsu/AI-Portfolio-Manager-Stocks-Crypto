# 任务清单

唯一的任务事实来源。一次只做一个任务；完成条件见文末"完成条件"。
计划是活的：新想法先进 Inbox，不打断当前任务；每完成一项，过一遍 Inbox 并更新下方汇总。

## 剩余未完成

Phase 0：0.2b
Phase 1：1.4
Phase 2：2.1 · 2.2 · 2.3
Phase 3：3.1 · 3.2
Phase 4：4.1 · 4.2 · 4.3 · 4.4

## 已确定的约定（来自 2026-10-01 重构访谈）

- 目标：全面重构，顺序为 代码清理 → AI 层 → 命名与可读性 → UI/UX 重设计；Hero 页最后做，并入全站重设计，原 B+C 方案作废
- 本轮重构不改变路由、功能和操作流程；UI 视觉与布局可大改
- 测试：Playwright E2E（`page.route` mock 外部接口）为主，保留现有 vitest 纯函数测试；E2E 并入 `init.sh`
- 防御性代码：只在信任边界（请求体、外部 API、LLM 输出）校验；不可达的防御一律删除；AI 失败显式报错，不再伪造"持有 50 分"
- AI：统一 DeepSeek（见 `docs/adr/0001-unify-on-deepseek.md`）；用 zod 结构化输出取代"提示词描述 JSON + 正则"；提示词只保留角色、方法论、语言
- 数据访问：SSE 和 AI 用 route handler，其余读写走 server actions，并修正 `CLAUDE.md` 约束措辞
- 术语以 `CONTEXT.md` 为准；文件名全部 kebab-case；代码注释统一中文，只写"为什么"
- 所有删除操作先出清单，经确认再执行

## Phase 0：安全网与 harness

- [x] **0.1** 清理残留 worktree；合并 `progress.md` / `feature_list.json` / `DEVLOG.md` / `INIT_CONTRACT.md` 后删除；精简 `CLAUDE.md`；调研文档存入 `docs/research/`（2026-10-01）
- [x] **0.2a** Playwright E2E 基线：公开页面（根路径语言重定向、未登录跳转、语言/主题切换、登录表单校验、条款与隐私页），已加入 `init.sh`（2026-10-01）
- [ ] **0.2b** 登录后的 E2E（登录、新增资产与交易、AI 分析页出结果）：需先定 Supabase 测试方案（独立测试项目 / 本地 Supabase），AI 与行情接口用 `page.route` mock。用户决定留到下一个工作日
- [x] **0.3** knip 死代码、死导出、死依赖清单（只出清单，确认后再删）：清单见 `docs/knip-report.md`，待确认后由 1.1 执行（2026-10-01）
- [x] **0.4** `finish-task` skill + `scripts/check-harness.sh` + Stop hook（源码改了但本文件未更新则拦截；Inbox 积压则提醒）（2026-10-01）
- [x] **0.5** `/api/*` 补身份校验（未登录返回 401）；`ai-summary` 改为服务端按 `user_id` 读持仓，不再信任客户端传入的 assets。有意的行为变化，经用户确认（2026-10-01）（2026-10-01）

## Phase 1：代码清理

- [x] **1.1** 按 0.3 清单删除死代码与依赖（删 34 个文件、8 个依赖；保留 groq、eslint-plugin-react-hooks、ui 未用导出、updateTransaction；2026-10-01）
- [x] **1.2** 删除不可达的防御代码（逐项列表确认）（已执行 A1、A2、B1–B3；已补扫并执行 A4–A10、B4、B5；2026-10-01）
- [x] **1.3** 去重：`ai-analysis` route 的 3 份 `generateText`、重复表单逻辑、`yahoofinance` 路由（先给目录结构方案再改）（D1–D4 已做：`runPersona`、`useQuotes`、`lib/hooks/use-symbol-search`、`lib/market-api`；表单 D5 经确认不做；2026-10-01）
- [ ] **1.4** 数据访问统一：移除 `/api/yahoofinance/*` 薄转发，改 server actions；更新 `CLAUDE.md` 与 `CONSTRAINTS.md`

## Phase 2：AI 层

- [ ] **2.1** `lib/ai.ts` 集中模型配置；全部统一 DeepSeek；删除 openrouter、groq 依赖
- [ ] **2.2** 结构化输出（zod）；失败显示"分析失败，重试"，不伪造结果
- [ ] **2.3** Persona 提示词数据化 + 单模板，精简；用真实 DeepSeek 实测稳定性，不稳则退回"短提示词 + 一次校验重试"

## Phase 3：命名与可读性

- [ ] **3.1** 按 `CONTEXT.md` 改名（`AgentResult`→`PersonaAnalysis`、`Coordinator`→`CommitteeVerdict` 等）；文件名 kebab-case；注释统一中文
- [ ] **3.2** 拆分过长组件和函数（如 `asset-table.tsx` 390 行）

## Phase 4：UI/UX 重设计

- [ ] **4.1** 确定设计方向（用户看完参考站点后选定）；设计 token 与组件基线
- [ ] **4.2** Dashboard 与 AI 分析页方案，经用户确认
- [ ] **4.3** 其余页面铺开
- [ ] **4.4** Hero 页最后做

## Inbox

开发中产生的新想法写在这里，格式：`- YYYY-MM-DD 想法（来源任务）`。每个任务完成时处理：并入某阶段 / 延后 / 丢弃。

- 2026-10-01 调研文档 `docs/research/refactor-ideas.md` 还提出：Supabase schema/RLS 不在仓库内、报价 N 次请求可批量化、分析结果不持久化、`ai/ARCHITECTURE.md` 与代码不符等，待逐条决定是否纳入（来源：任务 0.1）
- 2026-10-01 【已处理：0.2 补了 Playwright 例外，0.4 放宽了跨目录约束】`CONSTRAINTS.md` 的"禁止 vitest mock 外部 API"与 0.2 的 Playwright mock 方案冲突，"一个 session 不得改多个 features 子目录"与重构范围冲突，需在 0.2 / 0.4 修订（来源：任务 0.1）
- 2026-10-01 CI（`.github/workflows/test.yml`）目前只跑 vitest，尚未跑 E2E；0.2b 完成后一并加入（来源：任务 0.2a）
- 2026-10-01 E2E 里的主题用例依赖现有主题名（Dark），Phase 4 重设计主题时需同步更新（来源：任务 0.2a）
- 2026-10-01 `sign-up-form` / `forgot-password-form` 把服务端英文错误文案直接 toast，未走 i18n（来源：任务 1.2 补扫）
- 2026-10-01 `app/auth/callback/route.ts` 的失败重定向写死 `/ja/sign-in`，应按 locale 跳转（来源：任务 1.2 补扫）
- 2026-10-01 已知 lint warning：`use-portfolio-candlestick-chart.ts` 的 `useMemo`（来源：旧 progress.md）

## 变更记录

计划有变动时记一行：`YYYY-MM-DD 改了什么：原因`。

- 2026-10-01 1.2 清单中的 A3（`?? null`）撤销：quote 路由出错时返回 `{error}` 无 `price`，该写法可达
- 2026-10-01 0.2 拆为 0.2a / 0.2b：服务端直连 Supabase，`page.route` 拦不到登录与资产 CRUD，登录后的流程需要先定 Supabase 测试方案，用户决定留到明天
- 2026-10-01 新增 0.5（API 鉴权）：读调研文档发现 `/api/*` 无鉴权，属安全与成本风险，排在 Phase 1 之前
- 2026-10-01 新建本清单，取代旧 Task 2–5 的叙述式记录：重构访谈达成共识

## 完成条件（每个任务）

1. `./init.sh` 全过（build、lint、test，E2E 就绪后含 E2E）
2. 勾选对应任务并标注完成日期，更新"剩余未完成"
3. 检查相关 `ARCHITECTURE.md`、`CONTEXT.md`、`CLAUDE.md` 是否需要同步
4. 处理 Inbox，必要时写变更记录

## 历史（重构前已完成）

- [x] AI 分析页 SSE 流式推送（2026-06-15）
- [x] Portfolio AI Summary 重建：实时价格注入、流式渲染、提示词重设计（2026-06-19）
- [x] 类型依赖方向修正，统一 `features/assets/types/index.ts`（2026-06-19）
- [x] lib 层统一外部服务：`yahoo-finance.ts` 单例、`lang-instruction.ts`、`news-fetcher.ts`（2026-06-20）
