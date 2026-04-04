# AI Portfolio Manager — Stocks & Crypto

AIを搭載した**次世代型ポートフォリオ管理プラットフォーム**です。リアルタイムの市場データ、マルチエージェントAI分析、および自動資産トラッキングを統合しています。

---

## 🌟 主な機能

### 1. AI 投資意思決定システム (Agentic AI)

- **マルチエージェント協調分析**：ウォーレン・バフェットやジョージ・ソロスなどのトップ投資家の思考モデルをシミュレートし、特定の銘柄に対して深い価値評価を行います。
- **インテリジェント・コーディネーター (Coordinator)**：複数のAIアナリストの視点を統合し、最終的な投資判断（買い/保持/売り）および目標価格を提示します。
- **リアルタイム Web RAG 強化**：**Tavily API** を通じてインターネット上の最新ニュースや決算情報を取得し、AI分析が古いデータではなく、常に最新の情報に基づいていることを保証します。

### 2. ポートフォリオ管理と自動化

- **資産概要**：総資産、総損益、および収益率の推移をリアルタイムで追跡します。
- **持株 AI サマリー**：**Groq (Llama 3.3)** を呼び出し、現在のポートフォリオをワンクリックで分析。潜在的なリスクを特定し、資産配分のアドバイスを提供します。
- **デイリー・ダイナミック分析**：保有している株式や暗号資産に関する最新ニュースを自動的に集約し、市場の動向を即座に把握できます。
- **ビジュアルチャート**：インタラクティブなK線グラフ、資産配分レーダーチャート、および収益トレンドチャートを搭載。

### 3. 高度な市場モニタリング (Stocks & Crypto)

- **プロフェッショナル級チャート**：**TradingView** の高度なチャート、マーケットヒートマップ、およびティッカーテープを深く統合。
- **暗号資産ダッシュボード**：世界中の通貨の時価総額ランキング、価格変動、および市場センチメントをリアルタイムで追跡。

### 4. 国際化とセキュリティ

- **多言語対応 (i18n)**：日本語、英語、中国語に対応し、グローバルな利用シーンに適応。
- **認証システム**：**Supabase Auth** を使用し、安全なユーザー登録、ログイン、およびGoogleサードパーティ認証を実現。
- **データプライバシー**：Supabase RLS（行レベルセキュリティ）を利用し、各ユーザーのデータが完全にプライベートで安全であることを保証。

---

## 🚀 技术栈

- **フロントエンド**: [Next.js 16+](https://nextjs.org/) (App Router), React 19, TypeScript
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **バックエンド/DB**: [Supabase](https://supabase.com/) (PostgreSQL + Server Actions)
- **AI エンジン**: [Vercel AI SDK](https://sdk.vercel.ai/), [DeepSeek](https://www.deepseek.com/) (Reasoner/Chat), [Groq](https://groq.com/)
- **検索拡張生成 (RAG)**: [Tavily API](https://tavily.com/)
- **データソース**: Yahoo Finance, FMP API, TradingView Widgets
- **状態管理**: TanStack Query (React Query)

---

## 📂 プロジェクト構成 (一部)

```bash
app/
├── api/
│   ├── ai-analysis/    # DeepSeek マルチエージェント分析インターフェース
│   ├── assets/         # 資産サマリーおよびニュース取得インターフェース
│   └── yahoofinance/   # Yahoo Finance リアルタイム相場同期
├── dashboard/
│   ├── assets/         # ポートフォリオメイン看板
│   ├── ai/             # AI マスター分析ページ
│   ├── stocks/         # 株式市場リアルタイム監視
│   └── crypto/         # 暗号資産市場看板
components/
├── custom/
│   ├── ai/             # AI 分析フロー、エキスパートカード、意思決定バナー
│   ├── assets/         # 資産フォーム、K線図、収益統計
│   └── stocks/         # TradingView 各種コンポーネント
hooks/                  # 資産計算および取引ロジック Hooks
lib/ai/                 # AI プロンプト定義および Function Calling ツール
```

---

## 🛠️ ローカル開発

### 1. 環境変数の設定

`.env.example` をコピーして `.env.local` にリネームし、以下の必要なパラメータを入力してください：

```env
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabaseアノンKey
DEEPSEEK_API_KEY=DeepSeekキー
GROQ_API_KEY=Groqキー
TAVILY_API_KEY=Tavily検索キー
```

### 2. インストールと実行

```bash
pnpm install
pnpm dev
```

---

## 📝 開発ロードマップ

- [x] 多言語 i18n システムの構築
- [x] DeepSeek Reasoner 推論モデルの導入
- [x] リアルタイム Web RAG 強化分析
- [ ] 自動リスク評価レポートの出力
- [ ] リアルタイム価格変動プッシュ通知

---

## 📄 ライセンス

MIT License
