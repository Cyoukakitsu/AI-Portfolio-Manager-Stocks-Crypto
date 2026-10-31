import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

// 浮层默认展开，方便截图验收；真实使用时由触发器控制。
const meta = { title: "UI/Overlays" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const DialogOpen: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除这笔交易？</DialogTitle>
          <DialogDescription>
            删除后，BTC 的持仓量与成本会重新计算，此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">取消</Button>
          <Button variant="destructive">删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const MenuOpen: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline">BTC</Button>} />
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem>编辑持仓</DropdownMenuItem>
          <DropdownMenuItem>添加交易</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">删除</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const SelectOpen: Story = {
  render: () => (
    <Select defaultOpen defaultValue="1y">
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1m">1M</SelectItem>
        <SelectItem value="6m">6M</SelectItem>
        <SelectItem value="1y">1Y</SelectItem>
        <SelectItem value="ytd">YTD</SelectItem>
        <SelectItem value="max">全部</SelectItem>
      </SelectContent>
    </Select>
  ),
};
