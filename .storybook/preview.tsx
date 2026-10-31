import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { NextIntlClientProvider } from "next-intl";
import "../app/globals.css";
import ja from "../messages/ja.json";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    // 项目用 App Router，组件里的 useRouter 等要走对应的模拟
    nextjs: { appDirectory: true },
  },
  decorators: [
    // 与应用一致：深色是 .dark 类，浅色是默认；默认显示深色
    withThemeByClassName({
      themes: { dark: "dark", light: "" },
      defaultTheme: "dark",
    }),
    // 组件里用了 next-intl，这里提供日语文案（应用默认语言）
    (Story) => (
      <NextIntlClientProvider locale="ja" messages={ja}>
        <div className="min-h-screen bg-background p-8 text-foreground">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default preview;
