# 設計仕様：ニュース Supabase キャッシュ層

**日付**: 2026-05-17  
**ステータス**: 承認済み

---

## 背景・目的

現在、毎ページリロード時に保有銘柄ごとに Tavily API を 1 回呼び出している（10 銘柄 = 10 回/リロード）。これにより API 使用回数が急増する問題がある。

Supabase にキャッシュ層を設けることで、同一日内の重複呼び出しをゼロにする。

### 不採用方針と理由

| 方案 | 不採用理由 |
|------|-----------|
| A: localStorage 永続化 | マルチユーザー・マルチデバイスに非対応。異なるブラウザ・端末では効果なし |
| B: サーバーサイド In-memory キャッシュ | Vercel のサーバーレス環境では関数インスタンスが都度破棄されるため Map が保持されず実質無効 |
| C-2: Vercel Cron Job | ユーザーごとに保有銘柄が異なるため、Cron 実行時点で対象 symbol が不確定。実装複雑度に対して効果が薄い |

---

## 採用方針：オンデマンドキャッシュ（JST カレンダー日基準）

---

## データベース設計

### テーブル：`news_cache`

```sql
create table news_cache (
  symbol      text primary key,
  articles    jsonb        not null default '[]',
  cached_date date         not null,
  updated_at  timestamptz  not null default now()
);
```

- **キャッシュ粒度**: symbol 単位（ユーザー非依存・グローバル共有）
- **TTL 基準**: JST（UTC+9）の「今日の日付」
- 同一 symbol の異なるユーザーは全員同じキャッシュを参照する

---

## API Route 設計

### エンドポイント：`GET /api/assets/news`

**クエリパラメータ**:
- `symbols`: カンマ区切りの銘柄コード（例: `AAPL,TSLA`）
- `force`: `true` の場合、キャッシュをスキップして Tavily を強制呼び出し

**処理フロー（各 symbol ごと）**:

```
1. 現在の JST 日付を算出（UTC+9）
2. Supabase から symbol の cached_date を取得
3. cached_date == 今日 AND force != true
   → キャッシュを返す（Tavily 呼び出しなし）
4. それ以外
   → Tavily API を呼び出し
   → 結果を Supabase に upsert（symbol をキーに上書き）
   → 結果を返す
```

**キャッシュ有効条件**:
- `cached_date` が JST での今日の日付と一致する
- `force=true` が指定されていない

---

## フロントエンド設計

### `use-daily-analysis.ts`

- `refetch` 呼び出し時に `force=true` パラメータを付与して fetch
- `staleTime: 5 * 60 * 1000`（5 分）はそのまま維持し、同一セッション内の重複リクエストを防ぐ

### 刷新ボタンの動作

| 状態 | 動作 |
|------|------|
| 通常ロード | Supabase キャッシュを優先利用、当日データがあれば Tavily 呼び出しなし |
| 手動更新ボタン押下 | `force=true` で強制 Tavily 呼び出し → Supabase を更新 |

---

## エラーハンドリング

- Tavily 呼び出し失敗時: 空の articles を返す（既存の動作を踏襲）
- Supabase read 失敗時: キャッシュ miss として扱い、Tavily を呼び出す
- Supabase write 失敗時: ログを出力するが、Tavily の結果はそのままクライアントへ返す

---

## 想定効果

| 状況 | 変更前 | 変更後 |
|------|--------|--------|
| 10 銘柄 × 10 回リロード | 100 回 Tavily | 初回のみ 10 回、以降 0 回 |
| 複数ユーザーが同じ銘柄を保有 | ユーザーごとに呼び出し | 全員で 1 日 1 回共有 |
| 手動更新 | 毎回 Tavily | ボタン押下時のみ Tavily |
