import { describe, it, expect } from "vitest";
import { calculateAssetHoldings } from "../calculations";

describe("calculateAssetHoldings", () => {
  it("空交易记录时返回零值和 null 均价", () => {
    const result = calculateAssetHoldings([]);
    expect(result.total_quantity).toBe(0);
    expect(result.total_cost).toBe(0);
    expect(result.avg_price).toBeNull();
  });

  it("只有买入时正确计算数量、成本和均价", () => {
    const result = calculateAssetHoldings([
      { type: "buy", price: 100, quantity: 10 },
      { type: "buy", price: 200, quantity: 5 },
    ]);
    // 总成本 = 100×10 + 200×5 = 2000
    // 总数量 = 15
    // 均价 = 2000 / 15
    expect(result.total_quantity).toBe(15);
    expect(result.total_cost).toBe(2000);
    expect(result.avg_price).toBeCloseTo(133.33, 2);
  });

  it("买入后部分卖出时正确更新净值", () => {
    const result = calculateAssetHoldings([
      { type: "buy", price: 100, quantity: 10 },
      { type: "sell", price: 150, quantity: 4 },
    ]);
    // 净数量 = 10 - 4 = 6
    // 净成本 = 1000 - 600 = 400
    // 均价 = 400 / 6
    expect(result.total_quantity).toBe(6);
    expect(result.total_cost).toBe(400);
    expect(result.avg_price).toBeCloseTo(66.67, 2);
  });

  it("全部卖出后 avg_price 为 null", () => {
    const result = calculateAssetHoldings([
      { type: "buy", price: 100, quantity: 5 },
      { type: "sell", price: 120, quantity: 5 },
    ]);
    expect(result.total_quantity).toBe(0);
    expect(result.avg_price).toBeNull();
  });

  it("多次买入不同价格时加权均价正确", () => {
    const result = calculateAssetHoldings([
      { type: "buy", price: 10, quantity: 100 },
      { type: "buy", price: 20, quantity: 100 },
      { type: "buy", price: 30, quantity: 100 },
    ]);
    // 总成本 = 1000 + 2000 + 3000 = 6000，数量 = 300，均价 = 20
    expect(result.total_quantity).toBe(300);
    expect(result.total_cost).toBe(6000);
    expect(result.avg_price).toBe(20);
  });

  it("卖出价格不影响均价计算（均价只由买入成本决定）", () => {
    const buyOnly = calculateAssetHoldings([
      { type: "buy", price: 100, quantity: 10 },
    ]);
    const withSell = calculateAssetHoldings([
      { type: "buy", price: 100, quantity: 10 },
      { type: "sell", price: 999, quantity: 0 }, // 卖出数量为 0
    ]);
    expect(withSell.avg_price).toBeCloseTo(buyOnly.avg_price!, 5);
  });
});
