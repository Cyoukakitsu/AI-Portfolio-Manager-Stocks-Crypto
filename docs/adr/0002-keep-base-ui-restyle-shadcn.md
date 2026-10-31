# 保留 shadcn 底层的 Base UI 交互层，整体重写样式而不换组件库

界面显得死板，根源是 shadcn 的默认令牌和样式，而不是 Base UI（`@base-ui/react`）提供的交互行为（弹窗、下拉、焦点管理等无障碍逻辑）。因此保留 `components/ui` 的结构与 Base UI，重写其样式；不改用 MUI、Ant Design、Mantine 等自带强烈外观的库。

**Considered Options**:
- 换用其他组件库：这些库自带视觉风格，要改成黑白极简的加密风比重写 shadcn 样式更费力，也容易留下"某某库"的味道。
- 完全自写组件：无障碍与焦点逻辑成本高、易出错。
- 只调令牌不动组件：达不到"大改"的目标。
