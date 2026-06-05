# 任务分解

每次只做一个任务。完成验收标准后更新 `progress.md` 和 `feature_list.json`，再选下一个任务。

---

## Task 1：Hero Page 重设计

**目标**：按方向 B+C（Gemini UI 风格）实现落地页视觉重设计。

**范围文件**
- `features/hero/components/`
- `app/` 中对应的 hero 路由页面

**验收标准**
- [ ] `pnpm build` 通过，无类型错误
- [ ] 导航栏、首屏、功能介绍、页脚四个区块均已实现
- [ ] 响应式布局：移动端 / 桌面端均正常显示
- [ ] 中/英/日三语翻译键已在 `messages/` 中补全

---

## Task 2：AI 智能分析模块

**目标**：实现多角色 AI 投资分析流程——用户输入股票代码，2 个 Agent 并行分析，Coordinator 综合输出买卖建议。

**范围文件**
- `features/ai/`
- `app/api/` 中对应的 AI Route Handler

**验收标准**
- [ ] `pnpm build` 通过，无类型错误
- [ ] 输入股票代码后，至少两个 AgentPersona 能返回 `AgentResult`
- [ ] Coordinator 能输出 `CoordinatorResult`（含 verdict 和 buyRange）
- [ ] 分析结果正确写入 Supabase，刷新后可恢复
- [ ] 流式响应正常（进度步骤实时显示）

---

## Task 3：Dashboard 总览图表完善

**目标**：完善总资产概览页，整合股票与加密货币持仓，展示总资产折线图与资产分布饼图。

**范围文件**
- `features/dashboard/components/`
- `features/assets/components/portfolio-candlestick-chart.tsx`
- `app/` 中对应的 dashboard 路由页面

**验收标准**
- [ ] `pnpm build` 通过，无类型错误
- [ ] 总资产金额（多币种合计）正确显示
- [ ] 资产分布图表能区分股票与加密货币
- [ ] 数据加载中和空状态均有合适的 UI 反馈

---

## Task 4：Stocks 行情图表细化

**目标**：完善股票行情页，支持搜索个股、查看 K 线图与头条新闻联动。

**范围文件**
- `features/stocks/components/`
- `app/` 中对应的 stocks 路由页面

**验收标准**
- [ ] `pnpm build` 通过，无类型错误
- [ ] 搜索框能按股票代码跳转对应 K 线图
- [ ] 头条新闻与当前查看的股票联动
- [ ] TradingView Widget 组件卸载时无内存泄漏（DevTools 验证）
