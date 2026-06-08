# 任务分解

每次只做一个任务。完成验收标准后更新 `progress.md` 和 `feature_list.json`，再选下一个任务。

---

## Task 1：量化投资机构推荐股票页

**目标**：在侧边栏"股票"分类下新增「量化投资机构」入口，点击后进入专属页面，展示用户关注的 2 家量化机构及其推荐持仓股票。

**背景说明**
用户希望追踪自己关注的量化投资机构（如 Renaissance、Two Sigma 等）的持仓披露数据，在一个专属页面集中展示这两家机构推荐/持有的股票列表，方便参考。

**范围文件**
- `features/dashboard/components/app-sidebar.tsx` — 在 stocks 分类的 items 数组中新增入口
- `features/stocks/components/` — 新增 `quant-institutions.tsx` 页面组件
- `app/[locale]/dashboard/stocks/quant/page.tsx` — 新建路由页面
- `messages/zh.json` / `messages/en.json` / `messages/ja.json` — 补充 `nav.quantInstitutions` 翻译键

**验收标准**
- [ ] `pnpm build` 通过，无类型错误
- [ ] 侧边栏"股票"分类下出现「量化投资机构」菜单项，点击可跳转
- [ ] 页面展示 2 家量化机构的名称、简介
- [ ] 每家机构下展示其推荐/持仓的股票列表（至少含：股票代码、名称、持仓比例或推荐理由）
- [ ] 中/英/日三语翻译键已补全
- [ ] 响应式布局正常
