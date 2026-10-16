// Tavily 新闻搜索统一封装，暴露 fetchNews()，内置超时；失败（缺 key、超时、非 2xx）抛错，由调用方决定如何降级
export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedDate: string;
  content: string;
}

interface FetchNewsOptions {
  maxResults?: number;
  timeoutMs?: number;
}

export async function fetchNews(
  query: string,
  { maxResults = 5, timeoutMs = 5000 }: FetchNewsOptions = {},
): Promise<NewsArticle[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not set");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://api.tavily.com/search", {
      signal: controller.signal,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        topic: "news",
        max_results: maxResults,
        search_depth: "basic",
        include_answer: false,
      }),
    });

    if (!res.ok) throw new Error(`Tavily responded ${res.status}`);

    const data = await res.json();
    return (data.results ?? []).map(
      (r: {
        title: string;
        url: string;
        source?: string;
        published_date?: string;
        content?: string;
      }) => ({
        title: r.title,
        url: r.url,
        source: r.source ?? (() => {
          try {
            return new URL(r.url).hostname.replace("www.", "");
          } catch {
            return r.url;
          }
        })(),
        publishedDate: r.published_date ?? "",
        content: r.content ?? "",
      }),
    );
  } finally {
    clearTimeout(timer);
  }
}
