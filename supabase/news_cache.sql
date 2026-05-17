-- news_cache テーブル作成
-- Supabase ダッシュボード > SQL Editor で実行してください

create table if not exists news_cache (
  symbol      text primary key,
  articles    jsonb        not null default '[]',
  cached_date date         not null,
  updated_at  timestamptz  not null default now()
);

alter table news_cache enable row level security;

-- 読み取り：全員に許可（ニュースは公開データ）
create policy "news_cache_select_all"
  on news_cache for select
  using (true);

-- 書き込み：ログイン済みユーザーのみ許可
create policy "news_cache_upsert_authenticated"
  on news_cache for all
  to authenticated
  using (true)
  with check (true);
