-- news_cache テーブル作成
-- Supabase ダッシュボード > SQL Editor で実行してください

create table if not exists news_cache (
  symbol      text primary key,
  articles    jsonb        not null default '[]',
  cached_date date         not null,
  updated_at  timestamptz  not null default now()
);

-- キャッシュは公開データ（株式ニュース）のため RLS を無効化
alter table news_cache disable row level security;
