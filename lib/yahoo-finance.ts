// Yahoo Finance2 单例——全项目唯一实例，复用 cookie jar / crumb 缓存
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export default yf;
