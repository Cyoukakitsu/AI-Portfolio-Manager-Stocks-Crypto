// 公开页面的 E2E 基线：不依赖 Supabase 登录态
// 登录后的流程（资产、AI 分析）见 TASKS.md 任务 0.2b
import { expect, test } from "@playwright/test";

test.describe("根路径按浏览器语言重定向", () => {
  test.use({ locale: "ja-JP" });

  test("日语浏览器进入 /ja 并显示首页", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ja\/?$/);
    await expect(page.getByRole("link", { name: "PortfolioX" }).first()).toBeVisible();
  });
});

test("未登录访问 dashboard 会跳转到登录页", async ({ page }) => {
  await page.goto("/en/dashboard/assets");
  await expect(page).toHaveURL(/\/en\/sign-in/);
});

test("语言切换：ja ⇄ en", async ({ page }) => {
  await page.goto("/ja");
  await page.getByRole("button", { name: "切换语言" }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.getByRole("link", { name: "Get Started" }).first()).toBeVisible();
});

test("主题切换：选择 Dark 后 html 带 dark 类", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "mode Toggle" }).filter({ visible: true }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("登录表单：空提交显示校验错误，且不离开登录页", async ({ page }) => {
  await page.goto("/en/sign-in");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  await expect(page).toHaveURL(/\/en\/sign-in/);
});

test("登录页可以进入注册页", async ({ page }) => {
  await page.goto("/en/sign-in");
  await page.getByRole("link", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/en\/sign-up/);
});

test("服务条款与隐私页无需登录即可访问", async ({ page }) => {
  for (const path of ["/en/terms", "/en/privacy"]) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(path));
  }
});
