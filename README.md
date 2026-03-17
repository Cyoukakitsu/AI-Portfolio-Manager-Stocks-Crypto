# AI Portfolio Manager — Stocks & Crypto

株式・暗号資産を管理する **AI搭載のポートフォリオダッシュボード**です。

---

## 概要

リアルタイムの市場データ・チャート・AIチャットボットを一つのダッシュボードに統合した個人開発プロジェクトです。
ポートフォリオの収益管理から暗号資産市場の監視まで、投資に必要な情報をまとめて可視化します。

---

## スクリーンショット

> *(準備中)*

---

## 機能

### 実装済み

| カテゴリ | 機能 |
|---|---|
| **認証** | メール/パスワードでのサインアップ・サインイン（Supabase Auth） |
| **ポートフォリオ管理** | 資産の追加・編集・削除、売買トランザクション記録 |
| **ダッシュボード** | 総資産額・総損益カード、収益推移エリアチャート、アセット配分レーダーチャート |
| **株式市場** | TradingView連携のライブチャート・ヒートマップ・ティッカーテープ・Reuters最新ニュース |
| **Crypto市場** | 仮想通貨価格マーキー・コインリスト・ヒートマップ・市場ダッシュボード |
| **AIチャットボット** | OpenRouter経由のAI投資アシスタント（ストリーミング対応） |
| **ダークモード** | ライト/ダーク切り替え対応 |

### 実装予定

- AIによる自動ポートフォリオ分析・インサイト生成
- リスク分析・アセットアロケーション最適化提案
- 株式・Cryptoのアラート機能

---

## 技術スタック

```
フロントエンド         Next.js 16 (App Router) / React 19 / TypeScript
スタイリング           Tailwind CSS v4 / shadcn/ui
データフェッチ         Yahoo Finance API
チャート               Recharts / TradingView Widgets
認証 & DB              Supabase (Auth + PostgreSQL + RLS)
AI                    Groq (AI SDK) / Vercel AI SDK
フォームバリデーション  React Hook Form + Zod
```

---

## ディレクトリ構成

```
app/
├── (auth)/           # サインイン・サインアップ
├── dashboard/
│   ├── assets/       # ポートフォリオ管理（メイン画面）
│   ├── stocks/       # 株式市場ダッシュボード
│   ├── crypto/       # 暗号資産ダッシュボード
│   └── aichatbot/    # AIチャットボット
├── api/
│   ├── chat/         # AIチャット API (OpenRouter)
│   ├── yahoofinance/ # 株価データ API
│   └── fmp/          # ローソク足データ API
components/
├── custom/           # ページ固有コンポーネント
└── ui/               # shadcn/ui ベースコンポーネント
hooks/assetsHooks/    # ポートフォリオ計算カスタムHooks
services/             # Supabase Server Actions (CRUD)
lib/
├── schemas/          # Zod バリデーションスキーマ
└── supabase/         # クライアント・サーバー設定
```

---

## セットアップ

### 必要な環境変数

`.env.local` を作成して以下を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
FMP_API_KEY=
```

### インストール & 起動

```bash
pnpm install
pnpm dev
```

---

## セキュリティ

- **RLS（Row Level Security）**: Supabase の行レベルセキュリティを全テーブルに適用
- **IDOR対策**: 全DB操作で `user_id` による二重フィルタリング
- **ゼロトラスト**: 外部入力はすべてZodで検証後にのみDB書き込み

---

## ライセンス

MIT License
