# Stocks — 架构说明

## 职责

股票市场数据的聚合展示：高级 K 线图、全市场热力图、行情滚动 Ticker、头条新闻。纯展示层模块，不写入任何用户数据。

## 对外接口

### UI 组件

| 组件 | 说明 |
|---|---|
| `<AdvancedChart>` | TradingView 高级 K 线图（支持技术指标） |
| `<StockHeatmap>` | 标普 500 / 全市场热力图 |
| `<TickerTape>` | 股票行情滚动 Ticker |
| `<MarketDataStock>` | 单只股票实时报价卡片 |
| `<TopStories>` | 股票相关头条新闻列表 |

## 依赖关系

```
stocks
├── 外部：TradingView Widget（嵌入式 iframe）、yahoo-finance2（价格数据）
└── 内部：无（独立展示模块，不依赖其他 feature）
```

## 注意事项

- TradingView Widget 通过 `<script>` 动态注入，组件卸载时必须清理 DOM
- yahoo-finance2 请求在 Server Component / Route Handler 中发起，不在客户端直接调用
