import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
  },
  decorators: [
    // 与应用一致：深色是 .dark 类，浅色是默认；默认显示深色
    withThemeByClassName({
      themes: { dark: "dark", light: "" },
      defaultTheme: "dark",
    }),
    (Story) => (
      <div className="min-h-screen bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
