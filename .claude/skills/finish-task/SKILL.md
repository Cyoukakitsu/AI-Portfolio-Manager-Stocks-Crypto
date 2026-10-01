---
name: finish-task
description: 完成 TASKS.md 中的任务前的收尾检查：跑 init.sh、勾选任务、处理 Inbox、同步文档。声称任务完成之前使用。
---

按顺序执行，全部满足才能声称完成：

1. 运行 `./init.sh`，build / lint / test / E2E 全过；失败就修，不要跳过
2. `TASKS.md`：勾选对应任务并标注完成日期（`YYYY-MM-DD`），更新顶部"剩余未完成"
3. 检查并同步受影响的 `features/*/ARCHITECTURE.md`、`lib/ARCHITECTURE.md`、`CONTEXT.md`、`CLAUDE.md`
4. 处理 Inbox：每条并入某阶段 / 延后 / 丢弃；计划有变动则写一行变更记录
5. 提交（commit message 中文，`type: 任务 X.Y 描述`）

Stop hook（`scripts/check-harness.sh`）会在"源码改了但 TASKS.md 没改"时拦截。
