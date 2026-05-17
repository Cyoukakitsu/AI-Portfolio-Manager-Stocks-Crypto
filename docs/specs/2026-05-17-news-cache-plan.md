# News Cache (Supabase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase の `news_cache` テーブルを使い、Tavily API の呼び出しを JST 日付単位で 1 回/symbol に抑える。

**Architecture:** API Route がリクエストを受けたとき、まず Supabase のキャッシュを確認し、当日 JST のデータが存在すれば Tavily を呼ばずに返す。なければ Tavily を呼び出してキャッシュに upsert する。手動更新ボタンは `force=true` クエリパラメータで強制的に Tavily を呼ぶ。

**Tech Stack:** Next.js App Router, Supabase (`@supabase/ssr`), Tavily API, TanStack Query v5

---

## ファイル一覧

| 対象 | パス | 変更内容 |
|------|------|---------|
| 修正 | `app/api/assets/news/route.ts` | Supabase キャッシュ読み書きロジックを追加 |
| 修正 | `features/assets/hooks/use-daily-analysis.ts` | 手動更新時に `force=true` を付与する `forceRefetch` を追加 |
| 修正 | `features/assets/components/daily-analysis.tsx` | `refetch` → `forceRefetch` に差し替え |

---

## Task 1: Supabase に `news_cache` テーブルを作成

**Files:**
- 操作: Supabase ダッシュボードの SQL Editor で実行

- [ ] **Step 1: Supabase ダッシュボードの SQL Editor を開き、以下の SQL を実行する**

```sql
create table if not exists news_cache (
  symbol      text primary key,
  articles    jsonb        not null default '[]',
  cached_date date         not null,
  updated_at  timestamptz  not null default now()
);

-- キャッシュは公開データ（株式ニュース）のため RLS を無効化
alter table news_cache disable row level security;
```

- [ ] **Step 2: テーブルが正しく作成されたか確認する**

Supabase ダッシュボードの Table Editor を開き、`news_cache` テーブルが表示されることを確認する。カラムは `symbol`, `articles`, `cached_date`, `updated_at` の 4 つ。

- [ ] **Step 3: Commit（SQLファイルを残す場合）**

```bash
git add .
git commit -m "feat: Supabase news_cache テーブルを作成"
```

---

## Task 2: API Route にキャッシュロジックを追加

**Files:**
- Modify: `app/api/assets/news/route.ts`

- [ ] **Step 1: `app/api/assets/news/route.ts` を以下の内容に置き換える**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedDate: string;
  content: string;
}

export interface SymbolNews {
  symbol: string;
  articles: NewsArticle[];
}

function getJSTDateString(): string {
  const now = new Date();
  const jstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jstTime.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");
  const force = searchParams.get("force") === "true";

  if (!symbolsParam) {
    return NextResponse.json({ results: [] });
  }

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TAVILY_API_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const todayJST = getJSTDateString();

  const results: SymbolNews[] = await Promise.all(
    symbols.map(async (symbol): Promise<SymbolNews> => {
      // キャッシュ確認（force=true の場合はスキップ）
      if (!force) {
        const { data: cached } = await supabase
          .from("news_cache")
          .select("articles")
          .eq("symbol", symbol)
          .eq("cached_date", todayJST)
          .maybeSingle();

        if (cached) {
          return { symbol, articles: cached.articles as NewsArticle[] };
        }
      }

      // キャッシュミス or 強制更新 → Tavily を呼ぶ
      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            query: `${symbol} stock news today`,
            max_results: 1,
            search_depth: "basic",
            include_answer: false,
          }),
        });

        if (!res.ok) {
          return { symbol, articles: [] };
        }

        const data = await res.json();
        const articles: NewsArticle[] = (data.results ?? []).map(
          (r: {
            title: string;
            url: string;
            source?: string;
            published_date?: string;
            content?: string;
          }) => ({
            title: r.title,
            url: r.url,
            source: r.source ?? new URL(r.url).hostname.replace("www.", ""),
            publishedDate: r.published_date ?? "",
            content: r.content ?? "",
          })
        );

        // Supabase にキャッシュを upsert
        await supabase.from("news_cache").upsert({
          symbol,
          articles,
          cached_date: todayJST,
          updated_at: new Date().toISOString(),
        });

        return { symbol, articles };
      } catch {
        return { symbol, articles: [] };
      }
    })
  );

  return NextResponse.json({ results });
}
```

- [ ] **Step 2: 動作確認（ブラウザ or curl）**

開発サーバーを起動し、以下の URL にアクセスして `results` が返ることを確認する：
```
http://localhost:3000/api/assets/news?symbols=AAPL
```

2回目のアクセス（同じ symbol）で Supabase の `news_cache` テーブルにレコードが追加されていること、かつサーバーログに Tavily への fetch が1回しか出ないことを確認する。

- [ ] **Step 3: Commit**

```bash
git add app/api/assets/news/route.ts
git commit -m "feat: ニュース API に Supabase キャッシュ層を追加（JST 日付基準）"
```

---

## Task 3: フックに `forceRefetch` を追加

**Files:**
- Modify: `features/assets/hooks/use-daily-analysis.ts`

- [ ] **Step 1: `features/assets/hooks/use-daily-analysis.ts` を以下の内容に置き換える**

```typescript
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@/types/global";
import type { SymbolNews } from "@/app/api/assets/news/route";

type Params = { assets: Asset[] };

export function useDailyAnalysis({ assets }: Params) {
  const symbols = assets.map((a) => a.symbol);
  const forceRef = useRef(false);

  const { data, isFetching, dataUpdatedAt, refetch } = useQuery<SymbolNews[]>({
    queryKey: ["news", symbols],
    queryFn: async () => {
      const force = forceRef.current;
      forceRef.current = false; // 使用後にリセット
      const url = `/api/assets/news?symbols=${encodeURIComponent(symbols.join(","))}${force ? "&force=true" : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.results ?? [];
    },
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const forceRefetch = () => {
    forceRef.current = true;
    refetch();
  };

  const results = data ?? [];
  const hasNews = results.some((r) => r.articles.length > 0);
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return { symbols, results, isFetching, hasNews, lastUpdated, forceRefetch };
}
```

- [ ] **Step 2: Commit**

```bash
git add features/assets/hooks/use-daily-analysis.ts
git commit -m "feat: 手動更新時に force=true で Tavily を強制呼び出しするよう変更"
```

---

## Task 4: コンポーネントの `refetch` を `forceRefetch` に差し替え

**Files:**
- Modify: `features/assets/components/daily-analysis.tsx`

- [ ] **Step 1: `daily-analysis.tsx` の hook 呼び出しを修正する**

`features/assets/components/daily-analysis.tsx` の 89 行目付近を以下のように変更する：

変更前：
```typescript
const { symbols, results, isFetching, hasNews, lastUpdated, refetch } =
  useDailyAnalysis({ assets });
```

変更後：
```typescript
const { symbols, results, isFetching, hasNews, lastUpdated, forceRefetch } =
  useDailyAnalysis({ assets });
```

- [ ] **Step 2: ボタンの onClick を差し替える**

同ファイルの 105 行目付近を変更する：

変更前：
```typescript
onClick={() => refetch()}
```

変更後：
```typescript
onClick={() => forceRefetch()}
```

- [ ] **Step 3: 手動更新の動作確認**

ブラウザで以下を確認する：
1. ページを開いて新聞ニュースが表示される（初回は Tavily 呼び出し）
2. ページをリロードする → Supabase キャッシュから返るため Tavily を呼ばない
3. 更新ボタン（RefreshCw アイコン）を押す → Tavily が呼ばれ最新ニュースが表示される
4. Supabase の `news_cache` テーブルで `updated_at` が更新されていることを確認する

- [ ] **Step 4: Commit**

```bash
git add features/assets/components/daily-analysis.tsx
git commit -m "feat: 更新ボタンを forceRefetch に差し替え"
```

---

## Task 5: PR 作成

- [ ] **Step 1: ブランチを push して PR を作成する**

```bash
git push origin HEAD
gh pr create \
  --title "feat: ニュースAPIにSupabaseキャッシュ層を追加" \
  --body "$(cat <<'EOF'
## Summary
- Supabase の `news_cache` テーブルを追加し、Tavily API の呼び出しを JST 日付単位で symbol ごとに最大 1 回に抑制
- ページリロード時はキャッシュを優先利用し、Tavily を呼ばない
- 更新ボタン押下時のみ `force=true` で Tavily を強制呼び出し、キャッシュを更新

## 不採用方針
- **方案A (localStorage)**: マルチユーザー・マルチデバイスに非対応
- **方案B (In-memory Map)**: Vercel のサーバーレス環境ではインスタンス破棄により Map が保持されない
- **Vercel Cron Job**: 保有 symbol がユーザーごとに異なるため、Cron 時点で対象が不確定

## Test plan
- [ ] 初回アクセス時に Tavily が呼ばれ、Supabase の `news_cache` にレコードが作成される
- [ ] 同日の 2 回目以降のアクセスでは Tavily を呼ばずキャッシュを返す
- [ ] 更新ボタン押下で Tavily が呼ばれ、`news_cache` の `updated_at` が更新される

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
