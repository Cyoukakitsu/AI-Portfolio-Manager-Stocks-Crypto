# GOTCHAS — 踩坑记录

开发过程中遇到的 bug、AI 行为异常、出人意料的 edge case。
新功能开发前先浏览，避免重复踩坑。

---

## 格式

```
## [YYYY-MM-DD] 问题标题
**场景**：在做什么时遇到
**现象**：出了什么问题
**根因**：为什么会这样
**注意**：下次做类似功能时要留意什么
```

---

## [2026-06-19] react-markdown 默认不渲染 GFM 表格

**场景**：AI Summary prompt 要求输出 Markdown 表格，前端用 `ReactMarkdown` 渲染

**现象**：表格以原始文本 `| col | col |` 形式显示，不是 HTML 表格

**根因**：`react-markdown` v10+ 默认只支持 CommonMark，GFM（GitHub Flavored Markdown）表格需要插件

**注意**：安装 `remark-gfm`，并传入 `<ReactMarkdown remarkPlugins={[remarkGfm]}>`

---

## [2026-06-19] Promise.allSettled + yahoo-finance2 类型推断为 never

**场景**：在 API route 中用 `Promise.allSettled` 并行 fetch 多个 symbol 的报价

**现象**：`quotes[i].value.regularMarketPrice` 报 TypeScript 错误：`Property 'regularMarketPrice' does not exist on type 'never'`

**根因**：`yahoo-finance2` 的 `quote()` 有多个泛型重载，`Promise.allSettled` 的类型推断无法正确 narrow，`.value` 被推断为 `never`

**注意**：改用 per-item `async/await + try/catch` 代替 `Promise.allSettled`，类型推断正常

---

## [2026-06-19] System prompt 语言影响模型输出语言

**场景**：Portfolio AI Summary prompt 中分区标题写成中文（`## 持仓快照`），locale 为 `ja`

**现象**：模型忽略 locale 指令，全程输出中文

**根因**：免费模型优先跟随 system prompt 中的语言风格，而非语言指令

**注意**：system prompt 的结构标题统一用英文（`## HOLDINGS SNAPSHOT`），locale 指令加 `CRITICAL:` 前缀并明确说明语言代码含义

---

## [2026-06-20] Tavily fetch 两头实现行为不一致

**场景**：`getNews.ts`（AI tool）和 `news/route.ts` 各自直接 fetch Tavily API

**现象**：`getNews.ts` 无超时保护、缺 key 静默返回 `[]`；`news/route.ts` 有 5s AbortController、缺 key 抛 500。修一处，另一处仍是旧行为

**根因**：同一个 HTTP 操作复制了两份，参数和错误处理策略各自演化

**注意**：统一通过 `lib/news-fetcher.ts` 的 `fetchNews(query, { maxResults, timeoutMs })` 调用，超时和 key 检查只在一处维护

---

## [2026-06-20] YahooFinance 多处实例化导致连接资源浪费

**场景**：yahoo-finance2 被多个 API route 和 AI 工具函数各自 import 并 `new YahooFinance()`

**现象**：每个模块独立持有实例，cookie jar / crumb 缓存无法复用，请求数翻倍

**根因**：yahoo-finance2 在每个 `new YahooFinance()` 时会各自维护独立的 cookie jar 和 crumb，同一进程多实例等于重复握手

**注意**：统一通过 `lib/yahoo-finance.ts` 导出单例，所有路由和工具函数 `import yf from "@/lib/yahoo-finance"` 即可，禁止再各自 new

---

## [2026-06-20] locale 注入机制在两条 AI 路由中分叉

**场景**：`ai-analysis/route.ts` 和 `assets/ai-summary/route.ts` 都需要向 LLM 注入语言指令

**现象**：两条路由各自实现：一个硬判 `locale === "ja"`（英文不注入），另一个直接把 locale 字符串拼进 prompt

**根因**：没有共享的语言指令构建函数，新增语言需要同时改多处，且两种风格的指令措辞不一致

**注意**：统一使用 `lib/lang-instruction.ts` 的 `buildLangInstruction(locale)`，新增语言只改 `LOCALE_NAMES` 映射表

---

## [2026-06-15] 并行 Agent 改顺序执行导致总耗时翻倍

**场景**：为 AI 分析页实现 SSE 流式推送（Task 2），需要逐步推送每个 Agent 的结果

**现象**：最初设计为顺序执行 Agent1 → Agent2 → Coordinator，以便逐步 push SSE 事件。但这样总耗时从 ~15s 变成 ~25s（+10s）

**根因**：原代码用 `Promise.all` 并行跑两个 Agent，耗时取决于最慢的那个。改成顺序后变成两者相加

**注意**：SSE 流式推送不需要改变执行顺序。正确做法是保持 `Promise.all` 并行，对每个 Promise 附加 `.then()` 回调——谁先完成谁先 push 事件，总耗时不变，用户依然能看到卡片逐步出现

---

## [2026-11-01] 服务端渲染的 HTML 里写入用户主题，会造成 hydration 不匹配

**场景**：UI 重设计 Task 9，给落地页的 TradingView 迷你图传主题属性，值取自 `useTheme().resolvedTheme`

**现象**：浅色主题下页面左下角出现 Next 开发提示 "1 Issue"，控制台报 "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"；深色主题下没有。截图脚本只看 `pageerror`，这条是 `console.error`，所以脚本全部通过

**根因**：用户的主题存在 localStorage，服务端不知道，渲染时按默认的深色写出 `theme="dark"`；客户端 hydration 时读到 light，两边不一致。React 明确说这种不一致"不会被修补"，属性会一直错下去

**注意**：凡是把主题（或 localStorage、`window`、时间）写进会被服务端渲染的 HTML，都要避免首次渲染就取这个值。用 `useSyncExternalStore(subscribe, () => true, () => false)` 区分服务端与客户端，主题确定前只渲染占位。验证时要在深浅两套主题下各看一次浏览器控制台，不能只看截图是否生成

---

## [2026-11-01] 开发服务器不认新增的 `@utility`，页面 HTML 有类名却没有样式

**场景**：UI 重设计 Task 9，在 `app/globals.css` 新增 `@utility bg-dots`（点阵底纹），三个页面加了 `bg-dots` 类

**现象**：用户的开发服务器上看不到点阵。页面 HTML 里有 `bg-dots`，但服务器返回的 CSS 里没有对应样式；同样的代码 `pnpm build` 后用生产构建看，点阵正常

**根因**：开发服务器长时间不重启，样式缓存没有重新生成新增的工具类。不是代码问题

**注意**：往 `globals.css` 新增 `@utility`（或自定义 `@theme` 令牌）后，先重启 `pnpm dev` 并强制刷新，再判断代码有没有问题。排查方法：`curl` 取页面里的 CSS 地址，看 CSS 里有没有这个类名；有类名没样式就是缓存。Playwright 的 `reuseExistingServer: true` 会复用已有的旧服务器，截图前也要确认服务器是新的，或改在生产构建上截图

---

## [2026-11-01] Motion 的 `reducedMotion="user"` 只关位移和布局动画，透明度、高度动画仍会播放

**场景**：UI 重设计 Task 8，认证页只用透明度与高度做淡入淡出，并按 `DESIGN.md` 要求"开启 `prefers-reduced-motion` 时全部关闭"

**现象**：代码里加了 `<MotionConfig reducedMotion="user">` 就以为遵守了；Greptile 审查指出开启系统"减少动态效果"后淡入仍在播放

**根因**：`reducedMotion="user"` 的语义只是关闭 transform 与 layout 动画，`opacity`、`height` 等不受影响。用 Playwright 逐帧采样容器透明度确认：加了 `MotionConfig` 也会出现 0.1、0.2…的中间值

**注意**：要完全关闭，用 `useReducedMotion()` 把动画时长设为 0（本项目是 `features/auth/components/auth-card.tsx` 的 `useFadeDuration`）。验证方法：`browser.newContext({ reducedMotion: "reduce" })`，用 `requestAnimationFrame` 采样透明度，开启时应只有 0 和 1

---

## [2026-11-01] TradingView 新版 `tv-*` 组件的主题属性是 `theme`，不是 `color-theme`

**场景**：UI 重设计 Task 9，落地页迷你图 `tv-mini-chart` 需要跟随深浅主题

**现象**：代码一直传 `color-theme="dark"`，沙箱访问不了 TradingView，无法看到效果，只验证了属性会随主题切换

**根因**：下载 `https://widgets.tradingview-widget.com/w/en/tv-mini-chart.js` 及其引用的公共模块来读：新版 `tv-*` Web 组件声明的属性是 `theme`（`light` / `dark`，默认 `light`）与 `transparent`，搜不到 `color-theme`。`color-theme` 是 TradingView 旧版 iframe 嵌入件的属性名，两套写法不通用。未设 `theme` 时组件会读自己元素的 CSS `color-scheme` 判断深浅

**注意**：用 `tv-*` 组件时传 `theme`；用 iframe 形式的旧嵌入件（如股票页的 `colorTheme`）才是旧写法，Task 11 要逐个确认。拿不到真实渲染时，可以直接下载脚本读它声明的属性，比猜可靠。这仍是读脚本得出的结论，真实效果要在能访问 TradingView 的环境看

---

## [2026-11-01] shadcn lyra 风格的弹层写死了 `dark` 类，浅色主题下菜单仍是深色

**场景**：UI 重设计 Task 7，在 Storybook 里切到浅色主题检查下拉菜单

**现象**：页面是白底，但 `DropdownMenu` 和 `Select` 弹出的面板仍然是深色

**根因**：`base-lyra` 风格生成的 `dropdown-menu.tsx`、`select.tsx`（以及未使用的 `menubar`、`combobox`、`context-menu`）在弹层的 className 里直接写了一个独立的 `dark` 类，等于强制让面板用 `.dark` 的令牌，不跟随主题

**注意**：以后用 `shadcn add` 新增或重新生成这类弹层组件，先搜一遍 className 里有没有独立的 `dark`，有就删掉；检查弹层时必须深浅两套主题都截图看，不能只看深色

---

## [2026-11-04] 嵌入件跟随主题：TradingView 与 CoinGecko 的做法不同，涨跌色多数改不了

**场景**：UI 重设计 Task 11，让股票页、加密页的嵌入件在深色下不再是白底

**做法**：
- TradingView 旧版 iframe 嵌入件（`advanced-chart`、`stock-heatmap`、`top-stories`、`market-data-stock`）：从 `useTheme().resolvedTheme` 取主题，传 `theme` / `colorTheme`，并把主题放进 `useEffect` 依赖，切换时脚本重新注入（与加密页已有三个一致）。`advanced-chart` 另外写死了 `backgroundColor` / `gridColor`，要随主题给深色值
- TradingView `tv-*` Web 组件（`ticker-tape`）：属性是 `theme`，元素加 `key={theme}` 让它重新挂载
- CoinGecko 组件（`marquee-ticker`、`coin-list`、`converter`）：色值走属性（`background-color` 等），元素不监听属性变化，所以同样用 `key` 随主题重新挂载；色值集中在 `features/crypto/components/use-gecko-theme.ts`，与 `globals.css` 令牌一致，且 `positive-color` 给红（涨）、`negative-color` 给绿（跌）

**已知无法处理（读配置所得，未在真实页面逐个验证）**：TradingView 的热力图、头条新闻、市场数据、K 线嵌入件都没有可传的涨跌色属性，颜色由 TradingView 自己决定，可能仍是绿涨红跌，与设计稿的红涨绿跌不一致，只能保持原样

**注意**：新增嵌入件时先看它认哪套属性（`colorTheme` 还是 `theme`、有没有涨跌色属性），并在深浅两套主题下都看一遍。真实效果需登录后在浏览器里确认
