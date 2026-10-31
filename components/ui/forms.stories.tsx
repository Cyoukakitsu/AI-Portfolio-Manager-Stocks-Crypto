import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Skeleton } from "./skeleton";

const meta = { title: "UI/Basics" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fields: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="qty">数量</Label>
        <Input id="qty" className="num" placeholder="0.0000" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="memo">备注</Label>
        <Textarea id="memo" placeholder="可选" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="off">已禁用</Label>
        <Input id="off" disabled placeholder="不可编辑" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bad">数据有误</Label>
        <Input id="bad" aria-invalid defaultValue="-1" />
      </div>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="outline">outline</Badge>
      <Badge variant="destructive">警示</Badge>
      <Badge variant="up">▲ 2.14%</Badge>
      <Badge variant="down">▼ 1.37%</Badge>
    </div>
  ),
};

export const Cards: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardDescription>总资产（USD）</CardDescription>
        <CardTitle className="num text-3xl">91,126.32</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6">
        <div>
          <div className="text-xs text-faint">今日</div>
          <div className="num text-up">▲ +1,284.06 (+1.43%)</div>
        </div>
        <div>
          <div className="text-xs text-faint">累计</div>
          <div className="num text-up">▲ +10,375.57</div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>添加交易</Button>
        <Button variant="outline">导出</Button>
      </CardFooter>
    </Card>
  ),
};

export const TabsAndSkeleton: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="crypto">加密</TabsTrigger>
          <TabsTrigger value="stock">股票</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-3 text-muted-foreground">
          全部持仓
        </TabsContent>
      </Tabs>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
};
