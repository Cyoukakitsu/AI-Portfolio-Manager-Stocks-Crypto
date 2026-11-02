# 任务分解

每次只做一个任务。完成验收标准后更新 `progress.md` 和 `feature_list.json`，再选下一个任务。

---

## UI 视觉重设计（Task 6–13）

**总目标**：把界面从 shadcn 默认的暖米色风格，改成深色优先、黑白单色、红涨绿跌的加密原生风格，支持深浅两套主题。设计依据：[`DESIGN.md`](DESIGN.md)、[`CONTEXT.md`](CONTEXT.md)、`docs/adr/0001`–`0003`。

**范围约束**：只改视觉层，不改功能与信息架构。移动端放在最后，这轮只保证不坏。建议按顺序做，每个任务一条分支、一个 PR，各自通过 `./init.sh`。

### Task 6：工具链与设计令牌

**范围文件**：`app/globals.css`、`app/layout.tsx`、`components/theme-provider.tsx`、`features/dashboard/components/mode-toggle.tsx`、`package.json`、Storybook 与 Playwright 配置

- 开工前先验证 Storybook 能在 Next 16 + Tailwind v4 下跑通；跑不通则先向用户汇报，不硬撑
- `globals.css` 改为只含深色（默认）与浅色两套令牌，含 `--up`、`--down`、`--warn`；删除 `default`、`white` 主题
- 字体换成 Geist 与 Geist Mono，去掉 Playfair Display 与 JetBrains Mono
- 主题切换只剩深浅；旧的主题名存储值回退到深色
- [x] `./init.sh` 通过
- [x] 深浅切换正常，刷新后保持（Playwright 实测：切到浅色，刷新后仍为浅色）
- [x] 旧主题名（white / Crail / default）写入旧存储键后，页面仍显示深色且无报错（靠换存储键 `portfoliox-theme` 实现）
- [x] Storybook 在 Next 16 + Tailwind v4 下可构建并正确渲染（`.storybook/`、`pnpm storybook`、`pnpm build-storybook`；已关闭遥测）
- [x] Playwright 截图脚本可用（`pnpm shot`）
- [x] 警示色 `--warn` 的色值已向用户确认（琥珀色：深色 `#F0A020`、浅色 `#C97A00`）

**已知限制**：往 `portfoliox-theme` 里手动写入 `dark` / `light` 之外的值，会显示浅色（next-themes 不校验）。正常使用不会出现。

### Task 7：基础组件重写样式

**范围文件**：`components/ui/*`（只改样式，保留 Base UI 结构）

**范围收窄**：55 个组件里只有约 25 个被页面实际引用，只重写这些；未被引用的约 30 个不动（已通过令牌拿到新配色），是否删除见下方"清理未使用的 UI 组件"。

- 已重写：button（默认 40px / 14px / 600，按下缩放）、input、textarea、label、card（24px 内边距、线色边框）、badge（4px 圆角，新增 `up` / `down` 变体）、table（14px、灰色表头、12px 行距）、skeleton；select、dropdown-menu、popover、command、dialog、alert-dialog、field、tabs 的字号由 12px 提到 14px；弹层、侧边栏、标签页去掉阴影，卡片与弹层的边线统一为 `--border`
- Storybook 条目：`button`、`table`（模拟持仓表）、`forms`（输入框、徽标、卡片、标签页、骨架屏）、`overlays`（对话框、下拉菜单）
- [x] `./init.sh` 通过
- [x] 模拟持仓表的数字右对齐、等宽，涨跌色与 ▲▼ 符号正确（截图已检查）
- [ ] 核心组件的 Storybook 条目在深浅主题下都已由用户人工确认
- [ ] 按钮默认高度从 32px 提到 40px 后，dashboard 各页面（需登录，Playwright 无法直接截图）的布局由用户在本机确认没有错位

**未验证**：dashboard 内页需要登录，Playwright 截不到，Task 7 改动对这些页面的实际影响目前只能靠用户本机查看。

### Task 8：登录、注册与重置密码页

**范围文件**：`app/[locale]/(auth)/*` 及 `features/auth` 的样式

- 左侧品牌栏：去掉网格背景、两团发光和装饰柱图；米黄色 PNG logo 去掉（顶栏已有字标，左栏不再重复），标题与功能列表是定宽（max-w-md）内容块，在左栏内水平、垂直居中，随窗口缩放跟着栏中心移动（参考 Supabase 注册页的做法）；标题字号 lg 下 30px、xl 起 36px，避免窄栏时"ツール"折行；标题改 36px / 600 / -1.5px 负字距，第二行用 `--muted-foreground`；图标换 Phosphor light，图标块改 6px 圆角灰阶
- 表单卡片：去掉阴影与顶部渐变线，内边距 24px；标题用 Title 规格（24 / 600 / -0.6px）；标签改用 Task 7 重写的 `Label` 组件；链接用 `--strong` 加悬停下划线，键盘焦点显示 2px 焦点环
- 新增 `features/auth/components/auth-card.tsx`：`AuthCard`、`AuthHeader`、`FieldMessage` 与两个链接样式，四个表单共用，去掉重复的卡片与错误提示标记
- 动效：原先卡片、容器、逐字段三层叠加的上滑入场，收敛为容器一次 0.25s 淡入；视图切换与错误提示只做 0.15s 淡入淡出；用 `auth-card.tsx` 的 `useFadeDuration`（基于 `useReducedMotion`）遵守系统"减少动态效果"：开启时时长为 0。不能只用 `MotionConfig reducedMotion="user"`，它不关透明度与高度动画（Greptile 指出，见 `GOTCHAS.md`）；已用 Playwright 逐帧采样验证（开启时透明度只有 0 和 1，关闭时有中间帧）
- 输入框出错时加 `aria-invalid` 与 `aria-describedby`，边框随之变琥珀色；错误文字 `role="alert"`
- `e2e/pages.shot.ts` 的 PAGES 加入 `reset-password`
- [x] `./init.sh` 通过（build、lint、test 12/12）
- [x] 三个页面深浅主题截图已生成（`pnpm shot` → `test-results/shots/`），并检查了校验错误态、忘记密码视图、390px 手机宽度（无横向溢出、无未捕获异常）
- [ ] 三个页面深浅主题截图已由用户确认

**范围外、本任务未处理**
- 顶栏 `NavBar` 仍是旧样式（`border-primary/30`、`font-bold`、`backdrop-blur`），归 Task 9
- ~~Google 按钮硬编码英文~~：已改走 `messages/` 的 `auth.google.continue`（2026-11-01）。仍未处理：服务端 `auth.ts` 返回的 `"Validation failed"` 经 toast 直接显示；Zod 校验提示（如 "Password must be at least 6 characters"）在日文页面显示英文。需要补 `messages/` 键并让 schema 读翻译
- `public/header-icon.png` 现在没有任何引用，且是旧的米黄色配色，可删除，需用户确认

### Task 9：落地页与隐私、条款页

**范围文件**：`app/[locale]/(root)/*`、`features/hero`

- 顶栏 `NavBar`（登录、注册页也在用）：去掉背景模糊与 `border-primary/30`，改实色底 + 1px 线色底边；Logo 改 600 字重、负字距；注册链接改用 `buttonVariants`
- Hero：渐变文字、`font-serif` 去掉；点阵背景保留，但改用 `bg-dots` 工具类（颜色取自 `--foreground` 14% 混合，深浅主题自适应）；字标与标题改 600 字重加负字距，标题第一行用灰色、第二行用 `--strong`；徽标改中性描边；两个 CTA 改用 `buttonVariants`（次按钮 / 主按钮）；去掉 `✦` 装饰符（`messages/` 中 `hero.badge`）
- 功能区与页脚：卡片去掉玻璃底与金色边线，改 `--card` + 线色边框、12px 圆角、24px 内边距；页脚链接悬停去掉写死的金色 `#c9a84c`
- 隐私、条款页：点阵背景同样改用 `bg-dots`，标题改 600 字重，正文用 `--foreground` 以保证长文可读
- 动效：落地页所有入场动画移除（含 `whileInView`）。原先功能区的内容在整页截图里一直是透明的
- 删除 `globals.css` 里 Task 6 留下的过渡别名 `--font-serif`
- 迷你图：卡片改令牌色，给 `tv-mini-chart` 传 `theme`（`light` / `dark`）跟随主题
- `e2e/pages.shot.ts` 的 PAGES 加入 `terms`、`privacy`
- [x] `./init.sh` 通过（build、lint、test 12/12）
- [x] 落地页、隐私、条款页（以及换了顶栏的三个认证页）深浅主题截图已生成，浏览器控制台无报错与警告（dark / light 各 5 个页面检查）
- [ ] 页面截图已由用户确认
- [ ] 在能访问 TradingView 的环境确认：深色主题下 6 张迷你图是否真的变深色（沙箱拦截了 `widgets.tradingview-widget.com`，没看到真实效果。已读脚本确认该组件的主题属性是 `theme`，不是 `color-theme`，见 `GOTCHAS.md`；仍需在本机看真实渲染）

**踩坑**：把用户主题直接写进服务端渲染的 HTML 会让 hydration 不匹配（浅色主题下 Next 开发提示 "1 Issue"，且 React 声明"不会被修补"）。已记入 `GOTCHAS.md`。

**范围外、本任务未处理**
- 功能区四张产品截图（`public/Portfolio-Page.png` 等）是旧的米黄配色界面，与新设计不一致；已记入 Task 13 的最后一步，Task 10–13 全部合并后重新截取替换
- 手机宽度下导航只有语言与主题切换，没有登录、注册入口（落地页自身有 CTA）；属于功能与信息架构，本轮不动

### Task 10：Dashboard 外壳与首页

**范围文件**：`app/[locale]/dashboard/layout.tsx`、`features/dashboard/*`

- 顶栏：高度 `h-14` → `h-16`（设计稿 64px），底边沿用 `--border`
- 侧边栏：去掉入场动画（与 Task 9 一致）；logo 方块改灰阶描边；图标换 Phosphor light；菜单项在 `app-sidebar.tsx` 内覆盖为 `text-sm`、6px 圆角（不改 `components/ui/sidebar.tsx`）
- `WidgetCard`：去掉 `shadow-sm` 与悬停阴影，边线 `--border`；五种彩色图标底统一成灰阶（`accent` 的 key 保留，股票、加密页仍在传 `orange` 等值，调用方不用改）
- `UserAvatar`：写死的 `bg-amber-500` 改成 `bg-muted`；`ModeToggle` 只换边线令牌（改成直接切换仍是独立任务）
- `/dashboard` 首页只是重定向到资产页，无单独首页可改；资产页本体归 Task 13
- [x] `./init.sh` 通过（build、lint、test 12/12）
- [x] 在已登录浏览器里看过资产、股票、加密、AI 四页的外壳（深色看了资产页，浅色四页都看了），无错位、无残留彩色图标底；AI 页 Analyze 按钮与搜索框高度基本对齐
- [ ] 顶栏、侧边栏、卡片的深浅主题截图由用户确认

**未处理、留给后续任务**
- 资产页自己写的卡片（`shadow-sm`、`border-border/60`）仍有阴影，文件在 Task 13 范围内
- 加密页浏览器开发模式出现过一次 "1 Issue" 提示，重新加载后未复现，疑似嵌入件噪音，未确认原因

### Task 11：股票与加密货币页

**范围文件**：`app/[locale]/dashboard/stocks`、`crypto`，`features/stocks`、`features/crypto`

- TradingView 嵌入件：能反转涨跌色的（如 `positive-color`、`negative-color` 属性）改成红涨绿跌；不支持的保持原样，记为已知问题
- **深色主题下嵌入件仍是白底（2026-11-01 在真实页面确认）**：
  - 股票页写死浅色：`advanced-chart.tsx`（`"theme": "light"`）、`stock-heatmap.tsx`、`market-data-stock.tsx`、`top-stories.tsx`（`colorTheme: "light"`）
  - 加密页的 CoinGecko 组件写死白底：`marquee-ticker.tsx`、`coin-list.tsx`、`converter.tsx`（`background-color="#ffffff"`）
  - 加密页的 `crypto-heatmap.tsx`、`market-quotes.tsx`、`market-overview.tsx` 已按 `resolvedTheme` 切换，可作为参照
  - 做法：写死浅色的改成跟随 `resolvedTheme`（组件主题变化时要重新挂载），CoinGecko 组件的背景色与文字色改为随主题传值；某个嵌入件确实不支持深色的，记为已知问题
- [ ] `./init.sh` 通过；页面截图已确认（深浅两套主题；真实页面需登录，可用 ego-browser 配合用户登录后截图）
- [ ] 深色主题下股票页、加密页没有突兀的白底嵌入件（无法深色化的除外，并已记录）
- [ ] 已知问题清单（哪些嵌入件无法反转涨跌色、无法深色化）已记录到 `GOTCHAS.md`

### Task 12：AI 页

**范围文件**：`app/[locale]/dashboard/ai`、`features/ai`

- 买入、卖出标签改为中性色加文字，不使用红绿；`agent-card.tsx`、`coordinator-card.tsx` 里的绿色文字逐一检查
- 检查 `features/ai/components/search-bar.tsx` 里的 "Analyze" 按钮：Task 7 把默认按钮提到 40px 后，它与旁边搜索框（约 32px 高）很可能对不齐，需对齐高度（调按钮尺寸或搜索框高度，二选一）
- [ ] `./init.sh` 通过；页面截图已确认

### Task 13：资产页（最难，放最后）

**范围文件**：`app/[locale]/dashboard/assets`、`features/assets/components/*`、`features/assets/hooks/use-portfolio-candlestick-chart.ts`

- 持仓表、总资产卡、盈亏颜色改读 `--up`、`--down` 令牌
- lightweight-charts 的涨跌色、背景、网格与刻度文字改为运行时读取 CSS 变量，主题切换时同步更新
- 右侧面板按"可切换标的、带周期与区间控件"的结构预留布局，但本任务不实现切换逻辑
- 三个页面里绿色"在线"脉冲点改为中性色
- 持仓表每行的删除、展开按钮是 `size="icon"`，Task 7 之后从 32px 变成 40px，行高约 65px 偏松；改为 `icon-sm`（32px），行高回到约 56px
- 持仓表的数字列（持仓量、价格、盈亏率）改用 `num` 工具类并右对齐，涨跌符号带 ▲ / ▼
- [ ] `./init.sh` 通过
- [ ] 全仓无 `text-green-*`、`text-red-*`、`#22c55e`、`#ef4444` 等表达涨跌的写死颜色
- [ ] 页面截图在深浅主题下已确认
- **重截落地页功能区的四张产品截图**（Task 9 遗留，最后一步，需等 Task 10–13 全部合并后做）：
  - 替换 `public/Portfolio-Page.png`、`AI-Agent-Analysis.png`、`Stock-Page.png`、`Crypto-Page.png`，保持原文件名，`features-section.tsx` 不用改；这四张图现在是旧的米黄配色界面
  - 在 `e2e/` 新增截图脚本（建议 `pnpm shot:product`，文件后缀 `.shot.ts`）：默认深色主题，视口 1440×900，登录后依次打开资产、AI、股票、加密页，输出 16:9 的图；账号密码只从环境变量读取（如 `SHOT_EMAIL`、`SHOT_PASSWORD`），不进仓库
  - 必须在能访问 TradingView 且有真实持仓数据的本机运行，沙箱做不了（需要登录、Supabase、TradingView 域名）；AI 页需要先跑出一次分析结果再截
  - 截图前确认没有个人信息：持仓金额、邮箱、头像，必要时用测试账号的示例数据
  - [ ] 四张图已替换为新设计，落地页功能区在深浅两套主题下截图已确认
  - [ ] 截图里没有真实个人信息

### 清理未使用的 UI 组件（独立 PR，建议在 Task 7 之后做）

- `docs/knip-report.md`（2026-10-01）已列出 `components/ui` 下 32 个未使用文件，当时建议整文件删除，待用户确认
- 删除前用 `knip` 重新跑一遍，并确认 `pnpm build`、`./init.sh` 通过；删除后检查是否能一并移除无人使用的依赖（如只被 `chart.tsx` 使用的 `recharts`，删前需确认）
- 保留未使用的导出（属于组件库完整 API，删了下次 `shadcn add` 会回来）
- [ ] 用户已确认删除清单；[ ] `./init.sh` 通过

### 明暗模式切换按钮改为直接切换（独立 PR，2026-11-01 用户新增）

**范围文件**：`features/dashboard/components/mode-toggle.tsx`（目前只有它引用 `ModeToggle`，开工前再 grep 一次确认，用到的页面一并核对）

- 现状：点按钮会弹出下拉菜单，菜单里有"深色 / 浅色"两项
- 目标：点一下按钮就直接在深色与浅色之间切换，不再弹菜单；图标按当前主题显示（深色显示月亮，浅色显示太阳）
- 要点：用 `resolvedTheme` 判断当前主题；`aria-label` 沿用 `messages/` 的 `theme.toggle`；主题确定前（服务端渲染与首次 hydration）不能直接按主题渲染图标，否则会 hydration 不匹配（见 `GOTCHAS.md` 2026-11-01 条）；`theme.dark` / `theme.light` 两个文案键若不再使用，一并清理 `messages/` 里的 ja、en
- [ ] `./init.sh` 通过；深浅主题下点击都能切换，刷新后保持，控制台无 hydration 警告

### 视觉重设计之后的逻辑任务（独立 PR，另行排期）

- **点击持仓切换 K 线**：`selectedSymbol` 状态，选中后右侧显示该标的 K 线，再点回到组合总览；现金无走势，显示空状态
- **周期与区间联动**：日线 / 月线 / 年线与 1M / 6M / 1Y / YTD / 全部。月线至少看 1Y，年线至少看全部，区间太短时退回日线；月线、年线可前端聚合日线或由接口支持
- **单标的"全部"区间**：从该标的有数据的最早日期开始，不受首笔交易日限制；组合总览仍从首笔交易日开始。需关注接口 `from` 提前后的响应速度与缓存
- 开工前核对加密货币 `symbol` 格式是否与 Yahoo Finance 的 `BTC-USD` 一致

### 已发现、不在本次范围的问题

- `app/layout.tsx` 中 `<html lang>` 写死为 `"ja"`，不随 locale 变化
- `components/ui/chart.tsx`（recharts 封装）没有任何使用点，可考虑清理

---

## Task 14：AI 分析路由与前端加固（2026-11-01 审查所得，另行排期）

**背景**：对 PR #109（真流式）与结构化输出改动的静态审查，只读代码，未跑 build 和真实调用。UI 重设计期间不做，排期时单独一条分支、一个 PR。

**范围文件**：`app/api/ai-analysis/route.ts`、`features/ai/components/analysis-shell.tsx`、`features/ai/lib/schemas.ts`、`features/ai/types/index.ts`

**高优先级**
- 路由无登录保护：`proxy.ts` 的 matcher 排除了 `api`，`app/api` 下没有任何地方调用 `getAuthSession()`，任何人都能直接调用并消耗 DeepSeek / Tavily 额度，且违反 `CONSTRAINTS.md` 的认证约定。`POST` 开头先 `getAuthSession()`，未登录返回 401。
- 入参无校验（`route.ts` 约 28–42 行）：`personas` 元素不检查（传未知值会得到 `undefined` 的 system prompt）、可重复（前端 `key={agent.persona}` 会冲突）；`symbol` 不限格式与长度，直接拼进 prompt 并传给工具；`request.json()` 遇到畸形 body 会 500。按 `CONSTRAINTS.md` 用 Zod `safeParse`：`symbol` 建议 `^[A-Za-z0-9.\-=^]{1,15}$`，`personas` 用 enum 数组、1–2 个且不重复。

**中优先级**
- 客户端断开后服务端不停：`request.signal` 没传给 `streamText` / `generateText`；一个 agent 报错时另一个继续跑；断开后 `enqueue` 抛错，`catch` 里再次 `enqueue`、`finally` 里 `close()` 也会抛。传 `abortSignal`，出错时用内部 `AbortController` 中止另一个 agent，加 `safeEnqueue` 判断流是否已关闭。
- 原始错误信息发给客户端（约 102–104 行）：`err.message` 经 SSE 发出，前端直接 `toast.error(data.message)`，违反 `CONSTRAINTS.md`。改为通用文案，详情只写服务端日志。
- 结构化输出过严：`score` 必须是整数、`points` 必须正好 3 条，模型返回 `68.5` 或 4 条会让整次分析失败。`score` 改为 `z.number().min(0).max(100).transform(Math.round)`，或加一次重试。
- 行情失败时 coordinator 拿到价格 `$0`（约 90 行）：`quote?.regularMarketPrice ?? 0` 加 `.catch(() => null)`，失败无日志，而 `COORDINATOR_PROMPT` 要求 buyRange 锚定当前价。改用 agent 里 `getStockPrice` 的结果，或在 prompt 中明确写"价格不可用"，并记录日志。
- 步数预算可能偏紧（**未验证**）：`stepCountIs(5)` 要同时容纳 3 个工具调用与最后生成结构化输出的一步，模型串行调用并重试一次时可能没有位置输出。先记录 `finishReason` 观察，再决定是否调到 6。

**前端（`analysis-shell.tsx`）**
- 重新分析时的竞态：`abort()` 后旧请求的 `finally { setIsPending(false) }` 会在新请求已 `setIsPending(true)` 之后执行，新一轮的占位卡片与加载状态消失。改为 `if (abortRef.current === ctrl) setIsPending(false)`。
- SSE 解析会丢事件：`currentEvent` 声明在 `while` 循环内，`event:` 与 `data:` 落在不同 chunk 时事件被静默丢弃；`JSON.parse` 也没有保护。把 `currentEvent` 提到循环外，或按 `\n\n` 切分事件。

**顺手清理**
- `route.ts` 约 44–45 行有两行重复注释
- `types/index.ts` 里 `AgentResult` 的注释仍写"由 generateText + maxSteps 跑完"
- `AgentResult`、`CoordinatorResult` 与 zod schema 重复定义，改用 `z.infer` 推导

**验收标准**
- [ ] 未登录 `curl` 调用 `/api/ai-analysis` 返回 401
- [ ] 传未知或重复的 persona、非法 symbol 返回 400
- [ ] 分析途中关闭页面或点击重新分析后，服务端日志显示上一次请求已中止
- [ ] 模拟 agent 或 coordinator 失败时，前端只看到通用错误文案，服务端日志有详情
- [ ] 行情接口失败时 coordinator 不再收到 `$0`
- [ ] 连续点击两次分析，第二次的占位卡片与加载状态正常
- [ ] `./init.sh` 通过，并补充对应的 schema / 入参校验测试

**同时发现、不在本任务范围**：`app/api` 下其余路由同样没有调用 `getAuthSession()`（`yahoofinance/*`、`assets/news`、`assets/ai-summary`），排期时一并确认哪些需要加登录保护。

---

## Task 15：Hero 与认证页的可读性重构（2026-11-01，依据 `readable-code-review` 技能的评审）

**范围文件**：`features/hero/`、`features/auth/`、`app/[locale]/(root)/`、`app/[locale]/(auth)/`。不动 dashboard 与其它 feature（这两处 UI 刚重做完，短期内不会再改，重构风险最低；dashboard 之后会有交互与排版变化，先不碰）。

**本任务只做 A 组（纯重构，行为与页面不变）**：
- `AuthField`：把"标签 + 输入框 + 提示"在四个表单里的 9 处重复抽到 `auth-card.tsx`，统一 `aria-describedby` 的写法
- `NavBar`：控制区只渲染一份（原来移动端、桌面端各挂一份）；"功能"锚点改用 `Link href="/#features"`，去掉 `usePathname`、`useLocale`、`isHeroPage`
- 密码规则：新建 `schemas/password.ts`，`MIN_PASSWORD_LENGTH`、密码字段、"两次一致"校验各一处定义，4 个文件引用
- 隐私、条款页：抽出 `LegalDocument`，两页只剩章节列表
- `hero-section.tsx`：`useChartTheme` 取代嵌套三元，图表尺寸只写一处，`attrs` 改名，去掉多余的 `scriptLoaded`
- 注释修正：`sign-in-form.tsx` 的"实时校验"改成与代码一致；`auth.ts` 文件头注释补全
- 小项：`forgot-password-form.tsx` 去掉无效的 `key`、类名改用 `cn()`；`auth.ts` 去掉没有人用的 `locale = "ja"` 默认值；`features-section.tsx` 的 `featureIds` 改名 `features`
- **评估后不做**：淡入淡出三件套抽成 `FadeIn`。只有 3 处、每处 5 行，抽出后还要为动画缓动加参数，成本大于收益

**B 组（会改变行为，需先由用户决定，另开任务）**：
- 注册表单收集了 `name` 但 `signUp` 没有保存（全仓库搜不到 `full_name`、`user_metadata`）：要不要保存、存到哪里
- 三种错误返回约定并存（登录返回错误码，注册返回英文句子，`resetPasswordEmail`、`updatePassword` 的错误句没人读）：统一成"服务端返回错误码，客户端走 `messages/`"，同时消掉 `TASKS.md` 里记的 "Validation failed" 英文问题
- 忘记密码：发送失败也提示"已发送"，需要作者补注释说明是否有意

**未处理**：品牌名 "PortfolioX" 在 `hero-section.tsx`、`nav-bar.tsx` 里是硬编码，页脚用 `t("brand")`，统一哪一种需要用户定；`NavBar` 引用了 `features/dashboard` 里的 `LocaleSwitcher`、`ModeToggle`（跨 feature 依赖），等 dashboard 改完再整理；`eslint.config.mjs` 建议启用 `no-nested-ternary`。

**验收标准**
- [x] `./init.sh` 通过
- [x] 重构前后各跑一次 `pnpm shot`：隐私、条款、登录、注册、重置密码 10 张像素完全一致；`landing-*` 的差异只在迷你图区域（x 375–1064、y 556–889），改动前就存在（TradingView 渲染噪声）
- [ ] 登录、注册、重置密码、忘记密码四个表单的提交、校验错误提示由用户在浏览器里走一遍（我只验证了页面外观、校验文案与出错位置，没有真实提交；Supabase 提交流程没有测）
- [x] 顶栏"功能"链接实测：在登录页、首页、条款页点击都到 `/ja#features` 并滚动到功能区
- 实测补充：注册页"确认密码"的消息元素 id 由 `confirm-message` 变为 `confirm-password-message`（`AuthField` 统一命名），无其它引用

---

## Task 2：AI 分析页 SSE 流式推送

**目标**：将 `/api/ai-analysis` 从阻塞式 JSON 改为 SSE 流，Agent 结果逐张滑入，删除 `ProgressSteps` 假进度条。

**背景**
当前双 Agent 模式需等待全部完成（约 15 秒）才一次性渲染。改为 SSE 后，两个 Agent 仍然并行执行，哪个先完成哪张卡片先滑入，总耗时不变但第一张卡约 10 秒即可出现。设计文档：`docs/superpowers/specs/2026-06-15-ai-analysis-sse-streaming-design.md`

**范围文件**
- `app/api/ai-analysis/route.ts` — 改为 SSE ReadableStream，顺序执行 Agent，逐步 push 事件
- `features/ai/components/analysis-shell.tsx` — 替换 useMutation 为手动 SSE fetch reader，删除 ProgressSteps 相关代码
- `features/ai/components/progress-steps.tsx` — **整个文件删除**

**SSE 事件协议**
```
event: agent1_done / agent2_done  →  AgentResult JSON（并行执行，谁先完成谁先推）
event: coordinator_done           →  CoordinatorResult JSON（两个 agent 都完成后才启动）
event: error                      →  { message: string }
```

**验收标准**
- [x] `pnpm build` 通过，无类型错误
- [x] 选 1 个 Agent：约 10 秒后卡片带 fade-in 动画出现
- [x] 选 2 个 Agent：第一张卡片先出现，第二张随后滑入，最后 Coordinator 卡片出现
- [x] `ProgressSteps` 组件已删除，`runFakeProgress` 逻辑已删除
- [x] 用户中途关闭页面 / 重新分析可正确中止上一次请求（AbortController）
- [x] 分析失败时 `toast.error` 正常弹出

**✅ 完成于 2026-06-15**

---

## Task 3：Portfolio AI Summary リビルド

**目标**：输出格式结构化、流式实时渲染、注入实时价格数据、修复语言问题

**完成内容**
- 服务端并行 fetch Yahoo Finance 实时价格，计算现值和盈亏%注入 prompt
- 安装 `remark-gfm`，修复 Markdown 表格渲染
- 修复流式渲染：有 token 即时显示，不等 loading 结束
- 重设计 prompt：持仓快照表 / 风险评分 / 三大风险 / 行动建议
- Dialog 放大至 `max-w-3xl / max-h-[80vh]`
- 修复 locale 注入：英文 prompt 标题 + CRITICAL 语言指令

**✅ 完成于 2026-06-19**

---

## Task 5：lib 层重构 — 外部服务统一封装

**目标**：消除各路由/feature 中重复实例化外部服务的问题，统一注入机制

**完成内容**
- `lib/yahoo-finance.ts`：YahooFinance 单例，6 处 `new YahooFinance()` 统一替换
- `lib/lang-instruction.ts`：`buildLangInstruction(locale)` 统一 locale 注入，消除 `locale === "ja"` 硬判断
- `lib/news-fetcher.ts`：Tavily fetch 统一封装（超时 + 错误处理），`getNews.ts` / `news/route.ts` 两头对齐
- `lib/ARCHITECTURE.md`：新建共享层架构文档

**✅ 完成于 2026-06-20**

---

## Task 4：架构重构 — 类型依赖方向修正

**目标**：消除 feature 层从 route 文件 import 类型的反向依赖

**完成内容**
- 新建 `features/assets/types/index.ts`，统一 `Asset`・`Transaction`・`NewsArticle`・`SymbolNews`
- 删除 `types/global.d.ts` 和 `types/` 目录
- 更新 15 个文件的 import 路径

**✅ 完成于 2026-06-19**

