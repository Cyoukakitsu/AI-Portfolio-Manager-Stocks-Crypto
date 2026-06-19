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

## 进行中

- [ ] Hero Page 重设计（brainstorming 完成，方向 B+C，待实现）
- [ ] Stocks：行情图表与价格展示细化
- [x] AI 分析页 SSE 流式推送（Task 2，2026-06-15 完成）

## 已知问题

- Hero Page 设计方向 B+C 细节尚未最终锁定，实现前需确认

## 下一步

1. 确认 Hero Page 设计方案后开始实现（feat-hero）
2. AI 分析模块基础功能搭建（feat-ai）
3. Dashboard 总览图表完善（feat-dashboard）
