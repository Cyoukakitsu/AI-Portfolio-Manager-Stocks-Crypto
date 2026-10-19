#!/bin/bash
set -e

echo "=== 环境初始化 ==="

echo "=== pnpm build ==="
pnpm build

echo "=== pnpm lint ==="
pnpm lint

echo "=== pnpm test ==="
pnpm test

echo "=== 验证完成 ==="
echo ""
echo "下一步："
echo "1. 阅读 feature_list.json 查看当前功能状态"
echo "2. 选择一个未完成的功能"
echo "3. 只实现该功能，不跨范围修改"
echo "4. 声称完成前重新运行验证"
