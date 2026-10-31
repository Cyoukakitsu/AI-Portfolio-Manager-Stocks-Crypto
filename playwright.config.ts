import { defineConfig } from "@playwright/test";

// 只用来截图做视觉验收（UI 重设计），不是功能 E2E 测试。
// 文件后缀用 .shot.ts，避免被 vitest 的 *.test.ts 误收。
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.shot.ts",
  outputDir: "./test-results",
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
