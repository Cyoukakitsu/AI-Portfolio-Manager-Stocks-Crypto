"use client";

import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@/types/global";
import type { SymbolNews, NewsArticle } from "@/app/api/assets/news/route";
import { RefreshCw, ExternalLink, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Props = { assets: Asset[] };

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

function ArticleItem({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/item flex flex-col gap-0.5 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium leading-snug line-clamp-2 group-hover/item:text-primary transition-colors">
          {article.title}
        </span>
        <ExternalLink className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="truncate max-w-30">{article.source}</span>
        {article.publishedDate && (
          <>
            <span>·</span>
            <span>{timeAgo(article.publishedDate)}</span>
          </>
        )}
      </div>
    </a>
  );
}

function SymbolSection({ item }: { item: SymbolNews }) {
  if (item.articles.length === 0) return null;
  return (
    <div>
      <div className="px-4 py-1.5 flex items-center gap-2 bg-muted/30 border-b border-border/40">
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 font-mono font-semibold"
        >
          {item.symbol}
        </Badge>
      </div>
      {item.articles.map((article, i) => (
        <ArticleItem key={i} article={article} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-2.5 flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function DailyAnalysis({ assets }: Props) {
  const symbols = assets.map((a) => a.symbol);

  const { data, isFetching, dataUpdatedAt, refetch } = useQuery<SymbolNews[]>({
    queryKey: ["news", symbols],
    queryFn: async () => {
      const res = await fetch(
        `/api/assets/news?symbols=${encodeURIComponent(symbols.join(","))}`,
      );
      const json = await res.json();
      return json.results ?? [];
    },
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000, // 5 分钟内不自动重新请求
  });

  const results = data ?? [];
  const hasNews = results.some((r) => r.articles.length > 0);
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <div className="flex flex-col">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
        <span className="text-[11px] text-muted-foreground">
          {lastUpdated
            ? `更新: ${lastUpdated.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`
            : "持ち株の最新ニュースを取得中…"}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Content — scrollable, max-height matches chart card (~439px total) */}
      <div className="overflow-y-auto max-h-60 sm:max-h-85.25">
        {isFetching && !hasNews ? (
          <LoadingSkeleton />
        ) : symbols.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <Newspaper className="h-6 w-6 opacity-30" />
            <p className="text-xs">資産を追加するとニュースが表示されます</p>
          </div>
        ) : !hasNews ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <Newspaper className="h-6 w-6 opacity-30" />
            <p className="text-xs">ニュースが見つかりませんでした</p>
          </div>
        ) : (
          results.map((item) => <SymbolSection key={item.symbol} item={item} />)
        )}
      </div>
    </div>
  );
}
