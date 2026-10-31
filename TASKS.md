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

- [ ] `./init.sh` 通过；三个页面深浅主题截图已确认

### Task 9：落地页与隐私、条款页

**范围文件**：`app/[locale]/(root)/*`、`features/hero`

- [ ] `./init.sh` 通过；页面截图已确认

### Task 10：Dashboard 外壳与首页

**范围文件**：`app/[locale]/dashboard/layout.tsx`、`features/dashboard/*`

- [ ] `./init.sh` 通过；侧边栏、顶栏与首页截图已确认

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

### 清理未使用的 UI 组件（独立 PR，建议在 Task 7 之后做）

- `docs/knip-report.md`（2026-10-01）已列出 `components/ui` 下 32 个未使用文件，当时建议整文件删除，待用户确认
- 删除前用 `knip` 重新跑一遍，并确认 `pnpm build`、`./init.sh` 通过；删除后检查是否能一并移除无人使用的依赖（如只被 `chart.tsx` 使用的 `recharts`，删前需确认）
- 保留未使用的导出（属于组件库完整 API，删了下次 `shadcn add` 会回来）
- [ ] 用户已确认删除清单；[ ] `./init.sh` 通过

### 视觉重设计之后的逻辑任务（独立 PR，另行排期）

- **点击持仓切换 K 线**：`selectedSymbol` 状态，选中后右侧显示该标的 K 线，再点回到组合总览；现金无走势，显示空状态
- **周期与区间联动**：日线 / 月线 / 年线与 1M / 6M / 1Y / YTD / 全部。月线至少看 1Y，年线至少看全部，区间太短时退回日线；月线、年线可前端聚合日线或由接口支持
- **单标的"全部"区间**：从该标的有数据的最早日期开始，不受首笔交易日限制；组合总览仍从首笔交易日开始。需关注接口 `from` 提前后的响应速度与缓存
- 开工前核对加密货币 `symbol` 格式是否与 Yahoo Finance 的 `BTC-USD` 一致

### 已发现、不在本次范围的问题

- `app/layout.tsx` 中 `<html lang>` 写死为 `"ja"`，不随 locale 变化
- `components/ui/chart.tsx`（recharts 封装）没有任何使用点，可考虑清理

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

