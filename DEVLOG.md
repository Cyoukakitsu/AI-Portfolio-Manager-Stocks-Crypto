# DEVLOG — 开发日志

每次会话结束时记录当天做了什么。按日期倒序排列（最新在上）。

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
