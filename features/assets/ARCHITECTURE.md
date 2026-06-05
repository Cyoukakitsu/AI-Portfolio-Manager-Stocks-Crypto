# Assets — 架构说明

## 职责

用户投资组合资产的增删改查：持仓录入、交易记录管理、持仓净值实时计算、AI 总结与 OHLC 图表数据生成。

## 对外接口

### Server Actions

**`server/assets.ts`**

| 函数 | 说明 |
|---|---|
| `getAssets()` | 读取当前用户所有资产（含交易记录聚合） |
| `createAsset(data)` | 新增资产，同时写入初始买入交易 |
| `updateAsset(id, data)` | 更新资产基本信息 |
| `deleteAsset(id)` | 删除资产及其所有交易记录 |
| `deleteAllAssets()` | 删除当前用户的全部资产 |

**`server/transactions.ts`**

| 函数 | 说明 |
|---|---|
| `getTransactions(assetId)` | 读取某资产的所有交易记录 |
| `getAllTransactions()` | 读取当前用户的全部交易记录 |
| `createTransaction(data)` | 新增买入或卖出记录 |
| `updateTransaction(id, data)` | 修改已有交易记录 |
| `deleteTransaction(id)` | 删除单条交易记录 |

### 核心计算（`lib/calculations.ts`）

```ts
calculateAssetHoldings(transactions): { total_quantity, total_cost, avg_price }
```

所有持仓数值均由此函数从原始交易流水实时聚合，不在数据库中冗余存储均价。

### Schemas（Zod）

- `assetSchema` — 资产表单校验
- `transactionSchema` — 交易表单校验

### UI 组件

`<AssetTable>` / `<AssetForm>` / `<TransactionForm>` / `<TotalAssetCard>` / `<PortfolioCandlestickChart>` / `<SymbolSearch>` / `<PortfolioAISummary>` / `<DailyAnalysis>`

## 依赖关系

```
assets
├── 外部：Supabase（DB）、Zod、yahoo-finance2（价格查询）、@tanstack/react-query（hooks 数据管理）
└── 内部：features/auth（getAuthSession）
```

## 数据安全

所有 DB 查询必须附加 `.eq("user_id", user.id)` 过滤，防止 IDOR 越权访问他人数据。
