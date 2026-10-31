# DEVLOG — 开发日志

每次会话结束时记录当天做了什么。按日期倒序排列（最新在上）。

---

## 2026-11-01

**UI 视觉重设计：设计语言与前两个任务（PR #115、Task 7 叠加 PR）**
- 目标：界面从 shadcn 默认的暖米色风格，改为深色优先、黑白单色、红涨绿跌的加密原生风格；只改视觉层，功能与信息架构留到第二阶段
- 设计依据：以 `VoltAgent/awesome-design-md` 里 Binance（暗色结构、表格与数字规范）和 Vercel（Geist 字体、负字距）的规范为骨架；OKX 的真实数据没能提取到（Chrome 扩展与会话标签组对不上），设计稿是基于这些参考调整的草案，并先做了可交互的 HTML 预览供确认
- 新增 `DESIGN.md`、`CONTEXT.md`、`docs/adr/0001`–`0003`（只保留深浅主题、保留 Base UI 交互层、红涨绿跌）；`.gitignore` 给 `docs/adr/` 开例外；`TASKS.md` 加入 Task 6–13 与后续逻辑任务
- **Task 6**：`globals.css` 改为深色（默认）与浅色两套令牌，新增 `--up` / `--down` / `--warn`；字体换 Geist + Geist Mono；主题切换只剩深浅，存储键改为 `portfoliox-theme`；新增 Playwright 截图脚本（`pnpm shot`）与 Storybook
- **Task 7**：按设计稿重写被页面实际引用的约 25 个 `components/ui`（按钮默认 40px、卡片 24px 内边距、表格 14px 等），徽标新增 `up` / `down` 变体；补 Storybook 条目（按钮、模拟持仓表、表单与卡片、浮层、资产页的总资产卡与持仓表，均用示例数据）
- 在真实 dashboard 上验证：按钮变大没有造成布局错位；发现股票页、加密页的嵌入件在深色下仍是白底，已记入 Task 11

**踩坑**
- 文档里一度把交互层写成 Radix，实际 `components/ui` 全是 Base UI（33 个文件），已更正
- lyra 风格的 `dropdown-menu`、`select` 弹层写死了 `dark` 类，浅色主题下仍是深色（已修，记入 `GOTCHAS.md`）；当时只看了深色截图，教训是浮层必须深浅两套都看
- Supabase 项目被暂停，域名解析失败，登录不可用；恢复后本机 DNS 仍缓存着旧结果，需清缓存

**决定**
- 10-24 曾决定暂不引入 Playwright E2E；今天引入的 Playwright 只做截图验收，不写功能 E2E
- 约 30 个未被引用的 `components/ui` 不动，另开独立任务清理（`docs/knip-report.md` 已有清单）
- 点击持仓切换 K 线、日 / 月 / 年周期、单标的 YTD 与全部区间，作为视觉重设计之后的独立逻辑任务

---

## 2026-10-24

**AI 分析路由：结构化输出 + 去重**
- 新增 `features/ai/lib/schemas.ts`：agent / coordinator 的 zod schema，经 `generateText` 的 `Output.object` 约束模型输出
- `/api/ai-analysis`：三份重复的 `generateText` 合并为 `runAgent`，单人 / 双人分支统一；校验失败走 SSE `error`，不再静默降级为 `hold/50`
- 删除 `parse-agent.ts`（`cleanJSON` / `parseAgent`）
- 新增 `schemas.test.ts`；真实调用（DeepSeek 工具调用 + 结构化输出）验证稳定
- 评估后决定暂不引入 Playwright E2E（投入偏大）；prompts 中的 JSON 示例保留未动

---

## 2026-06-20

**lib 层重构 — 外部服务统一封装（Task 5）**
- `lib/yahoo-finance.ts` 新建：YahooFinance 单例（含 `suppressNotices`），6 处 `new YahooFinance()` 全部替换
- `lib/lang-instruction.ts` 新建：`buildLangInstruction(locale)` 统一 locale → 语言指令转换，消除 `ai-analysis` 中 `locale === "ja"` 硬判断和 `ai-summary` 中内嵌 locale 字符串两头分叉
- `lib/news-fetcher.ts` 新建：Tavily `fetchNews(query, { maxResults, timeoutMs })` 统一封装，`getNews.ts`（无超时）和 `news/route.ts`（有 AbortController）行为对齐

**Harness 全量更新**
- `lib/ARCHITECTURE.md` 新建：共享层职责、文件一览、使用约定
- `CLAUDE.md`：专题文档表新增 `lib/ARCHITECTURE.md` 条目
- `CONSTRAINTS.md`：i18n 约束改"英文/日文"（删除中文）；新增外部服务约束（禁止绕过 `lib/` 直接访问）
- `INIT_CONTRACT.md`：`lib/` 描述更新；`messages/` 改"英/日"
- `GOTCHAS.md`：新增 YahooFinance 多实例、locale 机制分叉、Tavily 两头实现三条踩坑记录
- `features/ai/ARCHITECTURE.md`：工具依赖、依赖关系、注意事项同步更新
- `features/assets/ARCHITECTURE.md`：依赖关系同步更新
- `features/stocks/ARCHITECTURE.md`：依赖改为 `lib/yahoo-finance`
- `features/dashboard/ARCHITECTURE.md`：LocaleSwitcher 改"英/日"
- `feature_list.json`：`feat-ai` 描述和 evidence 更新
- `TASKS.md`：补录 Task 5 完成记录
- `progress.md`：追加三项完成条目

---

## 2026-06-19

**量化投資機構機能の削除**
- `app/[locale]/dashboard/stocks/quant/page.tsx` 削除
- サイドバーの `quantInstitutions` エントリを削除
- `messages/en.json`・`messages/ja.json` の関連 i18n キーを削除

**UI ブランディング更新**
- サイドバー左上のロゴテキストを「AI Portfolio / Manager」→「PortfolioX」に変更

**Portfolio AI Summary リビルド**
- `/api/assets/ai-summary`：Yahoo Finance で各持ち高の現在価格・含み損益をサーバーサイドで取得しプロンプトに注入
- `remark-gfm` を導入し、Markdown テーブルを正しく HTML テーブルとして描画
- ストリーミングレンダリング修正：最初のトークン到着後すぐに Markdown が流れ込むよう変更（loading 終了まで待たない）
- プロンプト再設計：持ち高スナップショット表・リスクスコア・三大リスク・アクションアイテムの4構成
- Dialog を `max-w-3xl / max-h-[80vh]` に拡大
- ロケール注入を `CRITICAL:` 強調 + 英語ヘッダーに統一し、日本語ユーザーへの中国語出力バグを修正

**アーキテクチャリファクタリング（候補 4）**
- `features/assets/types/index.ts` を新設：`Asset`・`Transaction`・`NewsArticle`・`SymbolNews` を一元管理
- `types/global.d.ts`・`types/` ディレクトリを削除（空になったため）
- 依存方向の修正：feature 層が route ファイルから型を import していた逆転依存を解消（15 ファイル更新）

**Harness 更新**
- `GOTCHAS.md`：react-markdown GFM・allSettled 型推論・prompt 言語バグを追記
- `DEVLOG.md`・`progress.md`・`TASKS.md` を更新

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
