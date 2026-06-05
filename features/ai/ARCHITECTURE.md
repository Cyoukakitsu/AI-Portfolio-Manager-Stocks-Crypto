# AI — 架构说明

## 职责

多角色 AI 投资分析引擎：模拟 5 种投资大师视角并行分析，再由 Coordinator 综合输出最终买卖建议。

## 分析流程

```
用户输入股票代码
      ↓
  并行调用 2 个 AgentPersona
  （从 buffett/lynch/wood/burry/dalio 中选取）
      ↓
  每个 Agent 自主调用工具：
    getStockPrice(symbol)   ← yahoo-finance2
    getNews(symbol)         ← Tavily 搜索
    getFinancials(symbol)   ← yahoo-finance2 财报数据
      ↓
  Coordinator 汇总 → 最终 verdict + buyRange
```

## 对外接口

### 核心类型（`types/index.ts`）

| 类型 | 说明 |
|---|---|
| `AgentPersona` | `"buffett" \| "lynch" \| "wood" \| "burry" \| "dalio"` |
| `AgentResult` | 单个 Agent 的结论：`points / score / verdict / buyRange` |
| `CoordinatorResult` | 综合结论：`verdict / score / summary / buyRange` |
| `AnalysisResult` | 完整分析快照，前端展示与 Supabase 存储共用 |

### AI 工具（`lib/`）

| 工具 | 外部依赖 |
|---|---|
| `getStockPrice` | yahoo-finance2 |
| `getNews` | Tavily AI SDK |
| `getFinancials` | yahoo-finance2 |

### UI 组件

`<AnalysisShell>` / `<AgentSelector>` / `<AgentCard>` / `<CoordinatorCard>` / `<ProgressSteps>` / `<SearchBar>`

## 依赖关系

```
ai
├── 外部：Vercel AI SDK、DeepSeek / Groq（LLM）、Tavily、yahoo-finance2
└── 内部：features/auth（身份验证）
```

## 注意事项

- LLM 调用使用 `generateText + maxSteps`，非流式（源码注释确认）
- Agent 提示词集中在 `lib/prompts.ts`，修改需同步测试所有 persona
