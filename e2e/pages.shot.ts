import { expect, test } from "@playwright/test";

// 对不需要登录的页面，在深色 / 浅色两套主题下各截一张全页图，输出到 test-results/shots/。
// 做完一个页面的视觉任务后，把它的路径加进 PAGES。
// 需要登录的 dashboard 页面暂不在此列，等有可用的测试账号再补。
const PAGES = [
  { name: "landing", path: "/ja" },
  { name: "sign-in", path: "/ja/sign-in" },
  { name: "sign-up", path: "/ja/sign-up" },
];
const THEMES = ["dark", "light"] as const;
// 与 app/layout.tsx 里 ThemeProvider 的 storageKey 保持一致
const STORAGE_KEY = "portfoliox-theme";

for (const theme of THEMES) {
  for (const { name, path } of PAGES) {
    test(`${name} · ${theme}`, async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [STORAGE_KEY, theme],
      );
      const res = await page.goto(path);
      // 页面报错时必须失败，不能把错误页截成"通过"
      expect(res?.ok(), `${path} 返回 ${res?.status()}`).toBe(true);
      await page.waitForLoadState("load");
      // 等字体与入场动画稳定；TradingView 之类的嵌入件不会 networkidle，所以不用它
      await page.waitForTimeout(1200);
      await page.screenshot({
        path: `test-results/shots/${name}-${theme}.png`,
        fullPage: true,
      });
    });
  }
}
