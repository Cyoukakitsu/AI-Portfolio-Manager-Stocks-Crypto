import type { StorybookConfig } from "@storybook/nextjs-vite";

// 组件展示台：只用于 UI 重设计时的组件级视觉验收（见 TASKS.md Task 6–7）
const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(ts|tsx)",
    "../features/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-themes"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  core: { disableTelemetry: true },
};

export default config;
