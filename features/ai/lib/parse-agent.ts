import { AgentResult, AgentPersona } from "@/features/ai/types";

//清洗 AI 回答 + 解析成 JSON
export const cleanJSON = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return text;
  return match[0];
};

//只提取大括号里的 JSON 内容
export const parseAgent = (text: string, persona: AgentPersona): AgentResult => {
  try {
    const json = JSON.parse(cleanJSON(text));
    //成功了就把AI的回答解析成 JSON
    return { persona, ...json };
  } catch {
    //失败了就返回一个默认值：评分50，持有
    return { persona, points: [text], score: 50, verdict: "hold", buyRange: { low: 0, high: 0 } };
  }
};
