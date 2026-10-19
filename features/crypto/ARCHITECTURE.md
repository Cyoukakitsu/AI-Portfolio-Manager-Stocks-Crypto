# Crypto — 架构说明

## 职责

加密货币市场数据的聚合展示：实时行情、热力图、多币种对比图表、货币转换器、滚动行情 Ticker。纯展示层模块，不写入任何用户数据。

## 对外接口

### UI 组件

| 组件 | 说明 |
|---|---|
| `<CoinList>` | 主流币种列表（价格、涨跌幅） |
| `<CryptoHeatmap>` | 市值热力图 |
| `<MarketOverview>` | 市场概览（总市值、BTC 占比等） |
| `<MarketQuotes>` | 实时报价列表 |
| `<CoinCompareChart>` | 多币种价格走势对比 |
| `<Converter>` | 法币 ↔ 加密货币换算 |
| `<MarqueeTicker>` | 滚动行情 Ticker 条 |

## 依赖关系

```
crypto
├── 外部：TradingView Widget（嵌入式 script）、next-themes（深色/浅色主题适配）
└── 内部：无（独立展示模块，不依赖其他 feature）
```

## 注意事项

- TradingView Widget 通过 `<script>` 动态注入，组件卸载时必须清理 DOM，避免内存泄漏
- i18n：所有用户可见文字必须在 `messages/` 下有对应翻译键
