// 对应 Supabase `assets` 表
// 注意：avg_price 和 total_cost 并非数据库原始字段，
// 而是在 getAssets() 中通过聚合关联的 transactions 实时计算出来的派生值。
export type Asset = {
  id: string;
  user_id: string;
  symbol: string; // 交易代码，如 "AAPL"、"BTC-USD"
  fullname: string; // 完整名称，如 "Apple Inc."
  asset_type: "stock" | "crypto" | "etf" | "cash";
  created_at: string;
  avg_price: number | null; // 派生值：加权平均买入价；若从未买入则为 null
  total_cost: number; // 派生值：当前持仓总成本（买入总额 - 卖出总额）
  total_quantity: number; // 派生值：当前持仓总数量（买入总量 - 卖出总量）
};

// 对应 Supabase `transactions` 表
// type 使用联合类型而非 string，可在编译期防止写错值（如 "Buy" 或 "BUY"）
export type Transaction = {
  id: string;
  asset_id: string; // 外键，关联 assets.id
  user_id: string; // 冗余字段，用于行级安全（Row Level Security）直接过滤
  type: "buy" | "sell";
  quantity: number;
  price: number;
  traded_at: string; // 实际交易日期，格式 "yyyy-MM-dd"（区别于入库时间）
  created_at: string; // 记录创建时间，由数据库自动写入
};

// AI Analysis 相关类型

/**
 * 投资大师派别
 * 每个值对应一套不同的 system prompt 和分析风格
 */
export type AgentPersona =
  | "buffett" // 巴菲特：价值投资，护城河，长期持有
  | "lynch" // 彼得·林奇：成长股，PEG，消费者洞察
  | "wood" // 木头姐：颠覆式创新，TAM，5年期预测
  | "burry" // 迈克尔·伯里：逆向思维，泡沫识别
  | "dalio"; // 瑞·达利欧：宏观周期，全球配置

/**
 * 单个 Agent 的分析结论
 * 由 generateText + maxSteps 跑完后返回
 */
export type AgentResult = {
  persona: AgentPersona;
  points: string[]; // 3个核心观点
  score: number; // 0-100
  verdict: "buy" | "hold" | "sell";
};

/**
 * Coordinator 的综合结论
 */
export type CoordinatorResult = {
  verdict: "buy" | "hold" | "sell";
  score: number;
  summary: string;
  keyLevels: {
    entry: number; // 建议买入价
    stopLoss: number; // 止损价
    target: number; // 目标价
  };
};

/**
 * 一次完整分析的结果
 * 前端展示 + 存入 Supabase 都用这个结构
 */
export type AnalysisResult = {
  symbol: string;
  agentResults: AgentResult[];
  coordinator: CoordinatorResult;
  analyzedAt: string; // ISO 时间字符串
};

/**
 * 前端页面状态
 */
export type AnalysisStatus =
  | "idle" // 初始状态
  | "fetching" // 正在拉取股票数据
  | "analyzing" // Agent 分析中
  | "done" // 完成
  | "error"; // 出错

export type AnalysisState = {
  status: AnalysisStatus;
  currentPersona: AgentPersona | "coordinator" | null;
  result: AnalysisResult | null;
  error: string | null;
};
