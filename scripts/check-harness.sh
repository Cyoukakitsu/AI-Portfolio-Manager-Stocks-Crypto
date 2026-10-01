#!/bin/bash
# Stop hook：源码改了但 TASKS.md 没更新则拦截；Inbox 积压则提醒
# 退出码 2 = 拦截（stderr 回显给 Claude）；退出码 0 = 放行
cd "$(git rev-parse --show-toplevel)" || exit 0

# 已被拦截过一次再次触发时直接放行，避免死循环
grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0

# 工作区相对 HEAD 的改动（含已暂存、未跟踪）
changed=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } | sort -u)

src=$(echo "$changed" | grep -E '^(app|features|components|lib|i18n|messages|e2e|scripts)/|^(proxy\.ts|package\.json|init\.sh)$')
if [ -n "$src" ] && ! echo "$changed" | grep -qx 'TASKS.md'; then
  echo "源码已修改但 TASKS.md 未更新：请运行 finish-task（勾选任务、处理 Inbox、同步相关 ARCHITECTURE.md）后再结束。" >&2
  exit 2
fi

# Inbox 条目超过 5 条时提醒（不拦截）
inbox=$(awk '/^## Inbox/{f=1;next} /^## /{f=0} f&&/^- 20/' TASKS.md | wc -l | tr -d ' ')
if [ "$inbox" -gt 5 ]; then
  printf '{"systemMessage":"TASKS.md 的 Inbox 已积压 %s 条，建议在下一个任务完成时清理。"}\n' "$inbox"
fi
exit 0
