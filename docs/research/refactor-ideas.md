# PortfolioX 重构方向调研（2026-10-01）

> 性质：参考性调研，不是决定。用户尚无明确重构目标，本文给出"可选项 + 成本/风险"，不做实现。
> 约定：仓库此前没有 `docs/` 目录（`INIT_CONTRACT.md` 提到的 `docs/specs/` 实际不存在），故按任务要求新建 `docs/research/`。
> 来源标注：`[S#]` 对应文末来源表；"未验证"表示未能在一手来源确认，或需在本仓库实际版本上复核。
> 基线：本仓库 `next@16.1.6`、`react@19.2.3`、`ai@^6.0.105`、`@supabase/ssr@^0.8`，已开 `reactCompiler`、使用 `proxy.ts`。

---

## 1. 现状诊断

### 1.1 已经做对的（不建议动）

| 点 | 证据 |
|---|---|
| 已迁移到 `proxy.ts`，且用 `getClaims()` 刷新 session | `proxy.ts`、`lib/supabase/middleware.ts`；与 Next 16 / Supabase 官方推荐一致 [S1][S2][S11] |
| 持仓均价不落库，由交易流水实时聚合，且有单测 | `features/assets/lib/calculations.ts`、`__tests__/calculations.test.ts`；`CONSTRAINTS.md` 数据完整性条款 |
| Server Action 内部重新校验身份并带 `user_id` 过滤、Zod 校验 | `features/assets/server/assets.ts`；与 Next 官方"Action 是公开 POST 端点，必须在内部重新鉴权并校验资源归属"一致 [S3] |
| 外部服务单例/统一封装（yahoo、Tavily、locale 指令） | `lib/*.ts`，最近两个 PR |
| 有 GOTCHAS/ARCHITECTURE/CONSTRAINTS 文档化习惯 | 根目录与 `features/*/ARCHITECTURE.md` |

### 1.2 问题清单（按严重度）

**P0 安全/成本：`/api/*` 全部无鉴权**
- `proxy.ts` 的 matcher 显式排除了 `api`（`"/((?!api|_next/static|..."`），而 `app/api/**/route.ts` 内部没有任何 `getAuthSession/getClaims/getUser` 调用（grep 结果为空）。
- 受影响：`app/api/ai-analysis/route.ts`（DeepSeek，每次最多 3 次 LLM + 多次工具调用）、`app/api/assets/ai-summary/route.ts`（OpenRouter + Tavily）、`app/api/yahoofinance/*`、`app/api/assets/news/route.ts`。任何匿名请求都能消耗 LLM/Tavily 额度（成本放大）。
- Next 官方把 `proxy.ts` 与 `route.ts` 列为"权限很大、需重点审计"的位置，并建议对昂贵操作做限流 [S3]；同时指出 matcher 排除某路径会让该路径也绕过 Proxy，必须在每个入口内部验证 [S2]。
- `ai-summary` 还信任客户端传来的 `assets`（数量/成本由前端提交），可被伪造后喂给 LLM；应改为服务端按 `user_id` 读库。

**P1 AI 输出可信度：无 schema 校验的 JSON 解析 + 静默默认值**
- `features/ai/lib/parse-agent.ts` 用正则取 `{...}` 再 `JSON.parse`；失败时返回 `score: 50, verdict: "hold"`。`route.ts` 的 coordinator 同样失败即 `hold/50`。用户看到的是"像模型结论的假结论"。
- 三个 `generateText` 调用在 `route.ts` 中复制粘贴（模型名、tools、stopWhen、system 拼接各写一遍），单 persona 与双 persona 分支重复。
- AI SDK 提供 `Output.object({ schema })` 结构化输出，可与 tools 同请求使用（结构化输出计为一步，需相应设置 `stopWhen`）[S6][S5]。
- 分析结果不持久化：代码里只有 `assets / transactions / news_cache` 三张表的访问，无分析历史；无法回看、无法做成本与质量复盘。（`features/ai/ARCHITECTURE.md` 称 `AnalysisResult` "与 Supabase 存储共用"，与代码不符。）

**P1 渲染架构：几乎全是客户端取数 + 无 Suspense/缓存**
- 84 个 `use client` 文件；`app/`、`features/` 内没有 `loading.tsx`、`Suspense`、`use cache`（grep 为空）。`next.config.ts` 未开 `cacheComponents`。
- 报价取数在 `features/assets/hooks/use-total-asset-card.ts` / `use-asset-table.ts` 中：对每个 symbol 单独 `fetch("/api/yahoofinance/quote?symbol=")`（N 次请求），再用 react-query 共享 key。可改为服务端一次批量取价 + `use cache` 短 TTL，首屏直接带数。Cache Components 的模型正是"静态壳 + 缓存片段 + Suspense 流式动态片段"[S1][S2]。
- `app/[locale]/dashboard/assets/page.tsx` 页脚 `new Date().toLocaleString()` 在服务端渲染（靠 `suppressHydrationWarning` 掩盖）；开 Cache Components 后这类非确定值会被框架要求显式处理 [S2]，应移到客户端小组件。
- `use-asset-table.ts` 用本地 `useState` 缓存 transactionsMap，而项目已有 react-query，两套缓存并存。

**P2 数据层：schema 不在仓库里、类型手写**
- 仓库无 `supabase/` 目录（迁移、RLS 策略、生成类型均不在版本控制内；`git ls-files` 无 sql/migration）。`features/assets/types/index.ts` 手写。RLS 是否启用 → **未验证**（需在 Supabase 控制台确认）。
- 现在的安全完全依赖应用层 `.eq("user_id", user.id)`（CONSTRAINTS 的硬约束）。Supabase 官方建议所有暴露 schema 的表启用 RLS，策略写成 `(select auth.uid()) = user_id` 并给策略列建索引 [S7]。应用层过滤 + RLS 是纵深防御，不是二选一。
- `createAsset` "新增资产同时写入初始买入交易"（`features/assets/ARCHITECTURE.md`）：是否在一个 DB 事务内 → **未验证**（需读完整调用链与库内定义）。多表写入应由 DB 函数/RPC 保证原子。
- 删除资产级联删交易，应在 DB 里声明 `ON DELETE CASCADE`，而不是靠应用层顺序删除 [S9]（现状 → **未验证**）。

**P2 文档/边界漂移**
- `features/ai/ARCHITECTURE.md` 写"Agent 提示词集中在 `lib/prompts.ts`"，实际在 `features/ai/lib/prompts.ts`。`INIT_CONTRACT.md` 提到 `docs/specs/`、`TASKS.md` 引用 `docs/superpowers/specs/...`，仓库内均不存在。
- `lib/ARCHITECTURE.md` 说 `lib/` "不依赖任何 features"，但 `features/ai/lib`、`features/assets/lib` 又各自有 `lib/`，两个"lib"概念并存，新人难判断放哪。
- `features/dashboard` 依赖 `features/assets`（`SettingsModal` → `deleteAllAssets`），而 `dashboard` 被描述为"不处理业务数据"的壳；这是 feature 间横向依赖。
- 测试：只有 1 个测试文件；`CONSTRAINTS.md` 禁止 mock 外部 API（合理），但使 AI 路由、解析器、权限几乎无自动化覆盖。解析/校验这类纯函数完全可以不 mock 就测。

**P3 其他**
- `ai-analysis/route.ts` 手写 SSE，前端手写 fetch reader（`analysis-shell.tsx`）。AI SDK 已提供 agent + UI 流式响应的标准路径 [S5]，但"卡片级事件"协议当前够用，不紧迫。
- `getAuthSession` 用 `getUser()`（每次一次到 Auth 服务器的网络请求）；Supabase 文档说保护页面/数据首选 `getClaims()`，需要最新用户记录时才用 `getUser()` [S11]。属性能微优化，非 bug。
- 免责声明只存在于 `terms` 页文案（`messages/*.json` 的 `financialDisclaimer`），AI 输出卡片本身没有语境内免责/数据时间戳（见第 3 节）。

---

## 2. 候选重构方向

优先级：P0=应立刻做（风险修复）；P1=近期值得做；P2=有余力再做；P3=观望。成本按一个人的工作量粗估（S<0.5 天，M 1–3 天，L>3 天）。

### A. 给所有 `/api/*` 加鉴权 + 限流 + 输入校验 —— P0
- 做法：在 `features/auth/server/auth-helper.ts` 旁提供 route 可用的鉴权函数，每个 route 开头鉴权，失败返回 401；LLM/Tavily 路由加按用户限流与每日额度（Next 官方有 BFF 限流示例入口 [S3]；存储选型未验证）；请求体用 Zod 校验（现在 `ai-analysis` 手写 if，`ai-summary` 直接信任 body）。`ai-summary` 改为服务端读库，不再接收前端 assets。
- 收益：堵住额度被匿名刷爆、被伪造持仓喂模型；成本可控。
- 成本：S–M。风险：低（只加前置检查；同源 fetch 默认带 cookie）。
- 不建议：只把 `api` 从 proxy matcher 去掉当作"已修复"——Next 文档说不能只依赖 Proxy [S2]。

### B. AI 流水线收敛：单一 `runPersona` + 结构化输出 + 持久化 —— P1
- 做法：把 3 个重复的 `generateText` 收为 `features/ai/server/run-persona.ts`；用 `Output.object({ schema: zod })` 替换 `parseAgent`/`cleanJSON`；校验失败时发出明确的 error 事件而不是返回伪造的 `hold/50`；写入 `analysis_runs` 表（`user_id, symbol, persona, output, usage, model, created_at`）；记录 `usage` 观测成本 [S10]。
- 可选：用 `ToolLoopAgent` 封装 persona（文档称默认 20 步上限，`stopWhen` 可调）并用 `InferAgentUIMessage` 得到端到端类型 [S5]。注意官方文档当前示例使用 `isStepCount`、`toolApproval` 等名称，而本仓库用 `stepCountIs`；**AI SDK v6 与文档最新版的名称对应关系未验证**，改写前以 `node_modules/ai` 类型为准。
- DeepSeek 上下文缓存按请求前缀自动命中（尽力而为）[S12]：长而稳定的 persona system prompt 放最前、`symbol/locale` 等可变内容放后面可提高命中；命中字段 `prompt_cache_hit_tokens` 是否经 AI SDK 暴露 → **未验证**。
- 收益：结论可信、可回看、可审计、成本可见；路由代码减少约三分之一。
- 成本：M。风险：中（保持 SSE 事件协议不变可降低对 UI 的冲击）。
- 合规参照：FINRA 指出既有规则对生成式 AI 同样适用，强调模型治理、准确性与上线前评估 [S13]。本项目是个人工具而非持牌机构，不直接适用，仅作为"保留输入/输出/模型版本记录"的行业参照。

### C. features 内部走"深模块"：收窄接口、藏住复杂度 —— P1（低成本）
- 概念：深模块 = 简单接口 + 较多内部功能；浅模块 = 接口几乎和实现一样复杂（出自 Ousterhout《A Philosophy of Software Design》；本文引用的是对该书的二手概括，**一手原文未取到**，作者页只确认第 6 章名为 "General-Purpose Modules are Deeper"）[S14]。
- 对照本项目：
  - 好例子：`calculateAssetHoldings`、`lib/news-fetcher`（一个函数藏住超时与 key 检查）。
  - 偏浅：`features/assets/hooks/*`（8 个 hook 与组件一对一，只是把组件内部状态挪出来）；`server/assets.ts` 与 `transactions.ts` 每个 action 都重复 `getAuthSession → safeParse → 查询 → revalidatePath`。
- 做法：
  1. 引入 `features/assets/data/`（`import 'server-only'`）：`getPortfolio()` 返回已聚合的持仓 DTO（含交易聚合、可选批量现价），`recordTransaction()` 内部做校验 + 原子写入；`"use server"` 文件变薄，只做调用和 `revalidate`。这正是 Next 官方对"DAL + 变更也走 DAL"的推荐 [S3]。
  2. 每个 feature 只通过 `index.ts` 暴露公开 API，其他 feature 禁止深层 import（ESLint `no-restricted-imports` 即可，无需新工具）。
- 收益：测试面变窄；AI 与页面共用一份"组合快照"（`ai-summary` 不必再自己拼持仓）。
- 成本：M。风险：低–中（纯内部搬迁，行为不变）。

### D. 与 FSD（Feature-Sliced Design）对比：不建议整体迁移 —— P3
- FSD 有 app/pages/widgets/features/entities/shared 多层，规则是"只能从下层导入"，同层 slice 间不能互相引用 [S15]。官方自述：若"当前架构可用"则无需采用，团队/代码量增大时才值得 [S15]。
- 本项目（单人、约 70 个源文件）= 垂直 feature 切片 + 共享 `lib/` + `components/`，已是 FSD 的轻量近似。完整 FSD 会引入 widgets/entities 归类争论，收益不抵成本。
- 可借用的一条规则：**同层 feature 不互相依赖**。当前唯一违例是 `dashboard → assets`。处理：由 `app/` 层组装、以 props 注入"清空数据"动作，或让 `assets` 暴露公开 API。
- Next.js 与 FSD 结合的官方指南本次未取到 → **未验证**。

### E. 采用 Cache Components（`cacheComponents: true`）+ 服务端取数 —— P2
- 做法：先在一个页面试点（`dashboard/stocks` 或 `crypto`，公共行情数据最适合 `use cache` + `cacheLife`）；`assets` 页的用户数据放 `<Suspense>` 内流式出现，静态壳（侧边栏、标题）即时返回 [S2]；写操作用 `updateTag()`（read-your-writes）取代粗粒度 `revalidatePath` [S1]。
- 注意：开启后所有未缓存的运行时数据访问必须包 Suspense 或缓存，否则开发期报 blocking-route；`cookies()`（Supabase 读 session）属运行时 API，需在 Suspense 内读取 [S2]。默认 `use cache` 在 serverless 上是实例内存缓存、不跨请求持久；本项目 `output: "standalone"` 并已加 Cloud Run 部署配置，多实例下命中率有限，需共享缓存则要 `use cache: remote` 与 cache handler [S2]。
- 收益：首屏更快、客户端 JS 与请求数减少；与已开启的 React Compiler 互补。
- 成本：M–L。风险：中（缓存语义新，Cloud Run 多实例行为需实测）。
- 前置：先做 A、C，否则缓存会放大"谁能看到什么"的错误。

### F. Supabase 工程化：迁移、RLS、生成类型、CI —— P1（M）
- 做法：`supabase init` 把 schema 与 RLS 纳入仓库；对 `assets/transactions/news_cache` 启用 RLS，策略 `to authenticated using ((select auth.uid()) = user_id)` 并在 `user_id` 建索引 [S7]；用 `supabase gen types typescript` 生成 `database.types.ts` 并 `createClient<Database>()` 替换手写类型；CI 校验类型无漂移 [S8]。`news_cache` 若为共享缓存表，策略需单独设计（authenticated 只读，写入仅服务端）。
- 注意：官方说明 secret key 会绕过 RLS 且不得出现在浏览器 [S7]；本项目当前使用 publishable key + 用户 session（`lib/supabase/middleware.ts`），正好保持 RLS 生效。
- 收益：把"每条查询别忘 `.eq(user_id)`"这种靠人记的约束降级为兜底；类型漂移在编译期暴露。
- 风险：低–中（启用 RLS 前先在预发验证现有查询不被误拒）。
- Realtime：官方文档指出 Postgres Changes 对每个订阅者逐事件做 RLS 授权，规模大时吞吐受限，超过约 3000 并发订阅建议改用 Broadcast [S16]。本项目是个人用户，**暂不需要**；将来做"多设备实时同步持仓"时 Postgres Changes 足够。
- Edge Functions：官方定位是低延迟 HTTP、webhook、AI 编排，并强调冷启动与"短、幂等"，重型长任务应放后台 worker [S17]。本项目已有 Next 路由 + Cloud Run，**没有必要**迁移 AI 到 Edge Functions；该页未提 cron（定时刷新 `news_cache` 的可行性 → 未验证）。

### G. 抽象"行情提供方"接口 —— P3
- 现状：`yahoo-finance2` 是非官方抓取库，可能被上游限流/改版；`lib/yahoo-finance.ts` 已是单点，替换成本本来就低。
- 做法：仅在真出现稳定性问题时再暴露 `getQuotes(symbols)` 并在内部切换 provider。现在加接口属投机性抽象（YAGNI）。
- 同类开源项目参考：Ghostfolio = Nx monorepo + NestJS + Prisma/PostgreSQL + Redis + Angular，另有实验性 MCP server [S18]；规模与团队远大于本项目，其 `apps/ + libs/` 对应本项目 `app/ + features/ + lib/`，无需照搬 monorepo。Maybe 原项目已归档，社区 fork Sure 是 Rails 单体、AGPLv3、Docker 自托管，带可选 AI 助手 [S19]；说明个人理财产品可以是模块化单体，但技术栈不同，架构细节**未深入核对**。

### 汇总表

| 方向 | 收益 | 成本 | 风险 | 优先级 |
|---|---|---|---|---|
| A API 鉴权/限流/校验 | 防额度被刷、防伪造输入 | S–M | 低 | **P0** |
| B AI 流水线收敛+结构化输出+持久化 | 结论可信、可审计、省代码 | M | 中 | P1 |
| C 深模块/DAL + feature 公开接口 | 降复杂度、测试面小 | M | 低–中 | P1 |
| F Supabase 迁移/RLS/类型 | 纵深防御、类型安全 | M | 低–中 | P1 |
| E Cache Components | 首屏与请求数 | M–L | 中 | P2 |
| D 迁移到完整 FSD | 无明显收益 | L | 中 | P3 |
| G 行情 provider 抽象 | 暂无 | S | 低 | P3 |

---

## 3. UI/UX 新思路

说明：产品事实类论断附来源；"设计建议"是依据现状（`app/[locale]/dashboard/assets/page.tsx` 等）与原则做的推断，未经用户研究验证，请当作假设。

1. **组合总览的信息层级**：当前资产页是 KPI 卡 + AI 摘要 + 蜡烛图 + 日报 + 表格。建议首屏只回答三个问题：总值/当日变动、相对成本的盈亏、最大风险点（一句话）；其余下沉或折叠。（设计建议）
2. **涨跌色不能只靠红绿**：WCAG 1.4.1 要求"不能仅用颜色传达信息" [S20]；Robinhood 官方支持页确认有主题与设备级色盲滤镜设置 [S21]（"Accessible Colors" 这一具体开关名只见于二手资料，见 [S21] 备注）。建议涨跌同时用 `▲/▼` 与正负号，并提供色盲友好配色开关。日本与美股"红涨/绿涨"约定不同，把涨跌色做成 locale 感知设置值得考虑（设计建议，用户偏好未验证）。
3. **风险可视化**：`ai-summary/route.ts` 的 prompt 让 LLM 给"集中度/行业/宏观风险"1–10 打分。建议集中度（权重、前 N 大占比、HHI）由代码确定性计算并用条形/环形图展示，LLM 只负责解释——数值事实由代码给出，语言解释由模型给出。（设计建议）
4. **AI 解释性与可信度表达**：
   - 每条结论显示：使用的数据（价格时间戳、新闻来源链接）、模型与生成时间、"这是模拟 persona（如 Buffett 风格）而非本人观点"。
   - 结构化输出（方向 B）失败时展示"本次分析失败，请重试"，而不是默认 `hold/50`。
   - 免责声明就近放置（卡片底部一行 + 链接到条款），而不只在 `terms` 页。（设计建议；监管参照见 [S13]，它面向持牌机构，对本项目不构成法律要求）
5. **长耗时反馈**：已用 SSE 逐卡片推送（`TASKS.md` Task 2）；可补"正在调用 getNews…"状态，AI SDK 的 tool part 状态（`input-streaming / input-available / output-available` 等）可直接映射 [S22]。若将来引入"执行类"工具（如一键调仓），官方有工具执行审批机制要求用户确认 [S22]；本项目目前只读，不需要。
6. **移动端与暗色**：资产页已有 `sm:` 断点与 `ModeToggle`。建议专项检查：360px 宽下表格横向滚动/卡片化、图表触摸交互、暗色下涨跌色对比度（WCAG 具体阈值本次未取一手条文 → 未验证）。
7. **加载与空状态**：目前没有 `loading.tsx/Suspense`，首次加载会整页等待后一次性出现；骨架屏 + 空持仓引导（"先添加第一笔交易"）是低成本高收益项，且与方向 E 同向。

---

## 4. 软件工程 / 设计检查清单

可直接用于 PR 评审（括号内为本仓库当前状态）：

**边界与安全**
- [ ] 每个 `route.ts` 与 `"use server"` 函数内部都鉴权并校验资源归属（Action 是；Route 否）[S3]
- [ ] 昂贵外部调用（LLM、Tavily）有限流与额度（无）[S3]
- [ ] 客户端传来的业务数据不被信任，服务端按 `user_id` 重取（`ai-summary` 否）
- [ ] 仅 DAL 访问 `process.env` 与数据库；DAL 文件 `import 'server-only'`，返回最小 DTO [S3]
- [ ] DB 层有 RLS 兜底（未验证）[S7]

**数据完整性**
- [ ] 多表写入在 DB 事务/RPC 内完成（未验证）
- [ ] 外键与 `ON DELETE` 语义在 DB 中声明 [S9]（未验证）
- [ ] 派生值不落库（遵守）
- [ ] 金额类型与舍入策略有明确约定：`calculateAssetHoldings` 使用 JS `number`，个人组合下累计误差通常可接受但应在文档明示；库内是否 `numeric` 未验证

**设计（深模块视角）** [S14]
- [ ] 模块接口是否比实现小得多？（hooks/server 目录偏浅）
- [ ] 复杂度是否藏在模块内而非散落到调用方？（AI 路由三处重复）
- [ ] 同层 feature 无互相依赖（`dashboard → assets` 违例）[S15]
- [ ] 是否存在"只是转发"的包装层或一对一 hook？
- [ ] 是否存在没有第二个实现的接口/工厂（避免投机性抽象）

**AI 工程**
- [ ] 模型输出经 schema 校验，失败可见而非静默兜底 [S6]
- [ ] 每次调用记录 model、usage、延迟 [S10]
- [ ] 稳定内容放 prompt 前缀以利自动缓存 [S12]
- [ ] persona prompt 有离线回归样例（可不 mock：固定输入，断言输出符合 schema）

**框架用法**
- [ ] 动态/缓存边界显式（`use cache` / `Suspense`）[S2]
- [ ] `proxy.ts` 仅做乐观检查与 session 续期，不当作唯一防线 [S2][S11]
- [ ] 变更用 Server Actions + `updateTag/refresh` [S1]

**可维护性**
- [ ] 文档与代码路径一致（`prompts.ts` 路径、`docs/specs` 缺失）
- [ ] 解析/计算/权限等纯逻辑有测试（仅 `calculations`）
- [ ] `./init.sh`（build+lint+test）与 CI 一致（CI 目前只跑 vitest，见 `.github/workflows/test.yml`）

---

## 5. 推荐的下一步（最多 3 条）

1. **做方向 A（API 鉴权 + 限流 + Zod 校验，`ai-summary` 改为服务端读库）**。唯一的 P0：现在任何人都能刷 LLM/Tavily 额度。一个 PR，不涉及 UI。
2. **做方向 F 的"可见化"部分**：把 Supabase schema + RLS 策略 + 生成类型纳入仓库，并在控制台核对现有表是否已启用 RLS。先把"未验证"项变成已验证，再决定后续数据层重构范围。
3. **做方向 B 的最小版本**：抽出单一 `runPersona`，用 `Output.object` + Zod 取代 `parseAgent`，移除静默 `hold/50`；先不加持久化、不用 Agent 类，之后按需叠加。

方向 E（Cache Components）与 C（DAL/深模块）建议在 1–3 完成后再评估，因为缓存与重构都依赖"鉴权与数据边界已确定"。

---

## 来源

一手来源（官方文档/规范/官方仓库）：

- [S1] Next.js 16 发布博客（Cache Components、proxy、updateTag、React Compiler）：https://nextjs.org/blog/next-16
- [S2] Next.js 文档 Caching / Cache Components：https://nextjs.org/docs/app/getting-started/caching ；Proxy 文件约定（matcher；Server Function 不被排除路径保护；Migration to Proxy）：https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- [S3] Next.js 数据安全指南（DAL、Action 内重新鉴权、IDOR、限流、审计 proxy/route）：https://nextjs.org/docs/app/guides/data-security
- [S5] AI SDK 构建 Agents（ToolLoopAgent、stopWhen、Output.object、createAgentUIStreamResponse、InferAgentUIMessage）：https://ai-sdk.dev/docs/agents/building-agents
- [S6] AI SDK 生成结构化数据（Output.object、与 tools 组合、计为一步）：https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- [S7] Supabase Row Level Security：https://supabase.com/docs/guides/database/postgres/row-level-security
- [S8] Supabase 生成 TypeScript 类型：https://supabase.com/docs/guides/api/rest/generating-types
- [S9] Supabase 外键级联删除选项：https://supabase.com/docs/guides/database/postgres/cascade-deletes
- [S10] AI SDK Telemetry 与 usage 追踪：https://ai-sdk.dev/docs/ai-sdk-core/telemetry
- [S11] Supabase Next.js 服务端 Auth（getClaims / getUser / 不信任 getSession）：https://supabase.com/docs/guides/auth/server-side/nextjs
- [S12] DeepSeek 上下文缓存：https://api-docs.deepseek.com/guides/kv_cache
- [S13] FINRA Regulatory Notice 24-09：https://www.finra.org/rules-guidance/notices/24-09
- [S14] Ousterhout 作者页（仅确认书目与第 6 章名）：https://web.stanford.edu/~ouster/cgi-bin/book.php ；"深模块"定义的二手概括（线索，未回溯到原书页码）：https://www.goodreads.com/book/show/39996759-a-philosophy-of-software-design
- [S15] Feature-Sliced Design 官方概览：https://feature-sliced.design/docs/get-started/overview
- [S16] Supabase Realtime Postgres Changes：https://supabase.com/docs/guides/realtime/postgres-changes
- [S17] Supabase Edge Functions 概览：https://supabase.com/docs/guides/functions
- [S18] Ghostfolio 官方仓库：https://github.com/ghostfolio/ghostfolio
- [S19] Sure（Maybe 的社区 fork）仓库：https://github.com/we-promise/sure
- [S20] W3C WCAG 2.2 Understanding 1.4.1 Use of Color：https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- [S21] Robinhood 无障碍设置官方支持页：https://robinhood.com/gb/en/support/articles/accessibility-options/ ；"Accessible Colors" 开关名来自二手：https://www.behance.net/blog/how-robinhood-emphasizes-design-to-make-stock-trading-more-accessible
- [S22] AI SDK UI 工具调用流式与审批：https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

## 未验证 / 局限汇总

- Supabase 实际库内状态（RLS 是否启用、`createAsset` 是否事务、外键 CASCADE、金额列类型）：仓库内无迁移，未验证。
- AI SDK 文档最新版 API 名称（`isStepCount`、`toolApproval`）与本仓库 `ai@6.x` 的 `stepCountIs` 的对应关系：未验证。
- DeepSeek 缓存命中字段是否经 AI SDK provider metadata 暴露：未验证；DeepSeek 该页未给出价格差异。
- Cloud Run 多实例下 `use cache` 的实际命中表现：需实测。
- Ousterhout 原书对"深模块"的原文定义：只取到二手概括与作者页。
- Ghostfolio / Sure 的内部架构细节：只核对了 README 级信息，未读源码。
- Next.js 与 FSD 的官方结合指南：未取到。
- WCAG 非文本对比度具体阈值：未取一手条文。
- 文中 UI/UX 的"设计建议"为推断，非来自用户研究。
- 网页内容经抓取工具摘要后引用，个别措辞（如默认 20 步上限）应在采用前对照原文复核。
