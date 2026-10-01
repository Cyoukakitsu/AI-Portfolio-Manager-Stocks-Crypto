# PortfolioX

面向个人投资者的投资组合管理平台：记录股票与加密货币的交易，计算持仓，并让不同投资风格的 AI 给出分析。

## Language

### 资产与持仓

**Asset**:
用户关注并持有的一个标的（股票、加密货币或 ETF），由代码（symbol）唯一标识。
_Avoid_: Stock（仅指股票时才用）、Position

**Transaction**:
对某个 Asset 的一次买入或卖出记录，是持仓的唯一数据来源。
_Avoid_: Trade、Order

**Holding**:
由某个 Asset 的全部 Transaction 推算出的当前持有数量与成本。不单独存储，只能由计算得出。
_Avoid_: Position、Balance

### AI 分析

**Persona**:
一位投资大师的人设（Buffett、Lynch、Wood、Burry、Dalio），决定分析时采用的投资哲学与关注点。
_Avoid_: Agent、Analyst、分析师

**Persona Analysis**:
一个 Persona 对某个 Asset 的一次分析结论，包含观点、评分、Verdict 和 Buy Range。
_Avoid_: AgentResult、Agent 结论

**Committee Verdict**:
选择两个 Persona 时，对两份 Persona Analysis 综合后的最终结论。只选一个 Persona 时不产生。
_Avoid_: Coordinator、Chairman 结论

**Verdict**:
分析的方向性结论，取值只有买入（buy）、持有（hold）、卖出（sell）。

**Buy Range**:
建议买入的价格区间，必须以当前真实市价为基准，下限和上限都是实际数字。

**Portfolio Summary**:
对用户全部 Holding 的整体风险与建议报告，与单个 Asset 的 Persona Analysis 相互独立。
_Avoid_: AI Summary
