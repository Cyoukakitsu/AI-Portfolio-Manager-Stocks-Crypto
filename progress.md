# 项目进度

## 当前状态

- 最新 commit：feat/add-agent-harness 分支（待 PR 合并）
- 测试状态：CI 通过（GitHub Actions vitest 自动运行）
- Lint：通过（1 个已知 warning，use-portfolio-candlestick-chart.ts useMemo）
- Build：通过

## 已完成

- [x] Auth：Supabase SSR 注册 / 登录 / 重置密码
- [x] Assets：资产增删改查、交易记录、持仓计算
- [x] Crypto：仪表盘布局刷新 + i18n 多语言支持
- [x] yahoo-finance2 升级至最新版
- [x] GitHub Actions vitest CI 自动化
- [x] Harness 初始化（CLAUDE.md / CONSTRAINTS.md / feature_list.json / progress.md / init.sh / session-handoff.md）
- [x] 各功能模块 ARCHITECTURE.md（7 个）
- [x] AI 分析页 SSE 流式推送（2026-06-15）
- [x] Portfolio AI Summary リビルド：実時間価格注入・ストリーミング修正・プロンプト再設計（2026-06-19）
- [x] アーキテクチャリファクタ：型依存方向修正・`features/assets/types/index.ts` 統合（2026-06-19）
- [x] lib/yahoo-finance.ts 単例化：6 箇所の `new YahooFinance()` を統一（2026-06-20）
- [x] lib/lang-instruction.ts 導入：locale 注入を `buildLangInstruction()` に統一（2026-06-20）
- [x] lib/news-fetcher.ts 導入：Tavily fetch 二重実装を統一、タイムアウト・エラー処理を一元化（2026-06-20）
- [x] AI 分析路由结构化输出（zod + `Output.object`）与 runAgent 去重，删除 parse-agent（2026-10-24）
- [x] UI 重设计 Task 6：设计语言文档（`DESIGN.md`、`CONTEXT.md`、ADR）、深浅两套令牌、Geist 字体、Playwright 截图与 Storybook（PR #115，2026-11-01）
- [x] UI 重设计 Task 7：基础组件按设计稿重写样式并补 Storybook 条目（叠加 PR，目标 `feat/ui-redesign-tokens`，2026-11-01）

## 进行中

- [ ] Hero Page 重设计（brainstorming 完成，方向 B+C，待实现）
- [ ] UI 视觉重设计 Task 8–13（登录页 → 落地页 → dashboard 外壳 → 股票与加密页 → AI 页 → 资产页），见 `TASKS.md`
- [ ] Stocks：行情图表与价格展示细化
- [x] AI 分析页 SSE 流式推送（Task 2，2026-06-15 完成）

## 已知问题

- UI 重设计期间，资产页等处仍是旧的绿涨红跌写死颜色，股票页、加密页部分嵌入件在深色下仍是白底（分别在 Task 13、Task 11 处理）
- Hero Page 设计方向 B+C 细节尚未最终锁定，实现前需确认

## 下一步

0. UI 重设计：合并 #115 后合并 Task 7 PR，再做 Task 8（登录、注册、重置密码页）；同时可排"清理未使用的 UI 组件"
1. 确认 Hero Page 设计方案后开始实现（feat-hero）
2. AI 分析模块基础功能搭建（feat-ai）
3. Dashboard 总览图表完善（feat-dashboard）
