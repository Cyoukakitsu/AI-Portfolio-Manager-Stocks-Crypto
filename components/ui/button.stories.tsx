import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

// 验证 Storybook 工具链的第一个条目；Task 7 会按 DESIGN.md 重写样式并补齐其余组件。
const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Button" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(["default", "secondary", "outline", "ghost", "destructive", "link"] as const).map(
        (variant) => (
          <Button key={variant} {...args} variant={variant}>
            {variant}
          </Button>
        ),
      )}
      <Button {...args} disabled>
        disabled
      </Button>
    </div>
  ),
};
