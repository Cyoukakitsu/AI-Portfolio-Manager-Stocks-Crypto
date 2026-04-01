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

/** 分析结论方向 */
export type Verdict = "buy" | "hold" | "sell";

/**
 * 单个 Agent 的分析结论
 * 由 generateText + maxSteps 跑完后返回
 */
export type AgentResult = {
  persona: AgentPersona;
  points: string[]; // 3个核心观点
  score: number; // 0-100
  verdict: Verdict;
};

/**
 * Coordinator 的综合结论
 */
export type CoordinatorResult = {
  verdict: Verdict;
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
  coordinator: CoordinatorResult | null;
  analyzedAt: string; // ISO 时间字符串
};

