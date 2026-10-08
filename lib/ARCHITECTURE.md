# lib — 架构说明

## 职责

跨 feature 共享的逻辑层（含共享 hooks）。无 UI 组件，无页面路由，不依赖任何 `features/`。
`features/` 依赖 `lib/`，反向依赖禁止。

## 文件一览

| 文件 | 说明 |
|---|---|
| `yahoo-finance.ts` | yahoo-finance2 单例。全项目唯一实例，复用 cookie jar / crumb 缓存。**禁止在其他地方 `new YahooFinance()`** |
| `news-fetcher.ts` | Tavily 新闻搜索统一封装。暴露 `fetchNews(query, { maxResults, timeoutMs })`，内置超时和 API key 检查 |
| `lang-instruction.ts` | AI 语言指令生成。`buildLangInstruction(locale)` 返回注入 system prompt 的语言要求字符串。新增语言只改 `LOCALE_NAMES` |
| `api-auth.ts` | route handler / server action 身份校验：`rejectIfUnauthenticated()` 未登录返回 401，须在调用任何外部服务之前执行 |
| `market-actions.ts` | 行情 server actions：`getQuotes`（批量，因 action 串行执行）/ `searchSymbols` / `getHistory`；每个 action 先 `rejectIfUnauthenticated` |
| `market-api.ts` | 客户端访问行情的唯一入口：类型 + 对 `market-actions` 的重导出（`fetchQuotes` / `searchSymbols` / `fetchHistory`） |
| `hooks/use-symbol-search.ts` | 代码搜索 hook（防抖 + 查询 + 选中收起下拉），assets 与 ai 共用 |
| `utils.ts` | Tailwind 类名合并工具 `cn()`，shadcn/ui 标准写法 |
| `supabase/client.ts` | 浏览器端 Supabase 客户端 |
| `supabase/server.ts` | Server Component / Server Action 用 Supabase 客户端 |
| `supabase/middleware.ts` | Next.js middleware 用 Supabase 客户端（session 刷新） |

## 使用约定

- **新增外部服务封装**：放在 `lib/`，不要在各 feature 或 API route 中各自 import 并初始化
- **`supabase/`**：三个文件对应三种运行时环境，用错会导致 session 无法正确读取
- **`lang-instruction.ts`**：目前支持 `ja` / `en`，扩展新语言在 `LOCALE_NAMES` 中添加一行即可
