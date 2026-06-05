# CONSTRAINTS.md — 硬约束清单

本文件记录项目中**不可违反**的规则。所有开发者和 AI Agent 必须遵守。

---

## 安全

**禁止**在客户端代码中出现 `SUPABASE_SERVICE_ROLE_KEY` 或任何 AI 服务的 API Key。
**必须**将所有密钥操作限制在 `server/` 目录下的 Server Actions 或 Route Handlers 中。

**禁止**直接使用来自客户端的原始数据（`formData`、请求 body）写入数据库。
**必须**先经过 Zod schema 的 `safeParse` 校验，只使用 `result.data`。

**禁止**在 Server Actions 的错误响应中透传 Supabase / 第三方服务的原始 `error.message`。
**必须**返回通用错误文案，防止内部实现细节泄露。

**禁止**在 DB 查询中省略 `.eq("user_id", user.id)` 过滤条件。
**必须**确保每条涉及用户数据的查询都绑定当前用户 ID，防止 IDOR 越权。

---

## 认证

**禁止**在 `features/auth/` 以外的模块自行创建 Supabase client。
**必须**通过 `getAuthSession()` 获取统一的 `{ supabase, user }` 对象。

---

## 国际化（i18n）

**禁止**在组件中硬编码用户可见的中文/英文/日文字符串。
**必须**在 `messages/` 目录下添加对应翻译键后再使用 `useTranslations()` 引用。

---

## 代码范围

**禁止**在一个 session 中同时修改多个功能模块（`features/` 下的不同子目录）。
**必须**从 `feature_list.json` 选定一个功能后，只修改该功能相关的文件。

**禁止**在未运行 `./init.sh` 验证通过的情况下声称功能完成。
**必须**提供 `pnpm build`、`pnpm lint`、`pnpm test` 三项全部通过的证据。

---

## Git

**禁止**使用 `--no-verify` 跳过 git hooks。
**禁止**直接向 `main` 分支 force push。
**必须**通过 PR 合并代码，CI（vitest）通过后才可合并。

---

## 测试

**禁止**使用 vitest mock 伪造数据库或外部 API 响应。
**必须**使用真实集成测试或手动验证，记录验证证据到 `progress.md`。

---

## 数据完整性

**禁止**在数据库中冗余存储可由交易记录实时计算的数值（如均价、总成本）。
**必须**通过 `calculateAssetHoldings(transactions)` 在服务端聚合计算。
