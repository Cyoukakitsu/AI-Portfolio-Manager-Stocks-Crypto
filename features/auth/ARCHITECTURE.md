# Auth — 架构说明

## 职责

用户身份认证全生命周期管理：注册、登录、忘记密码、重置密码、退出登录，以及向其他功能模块提供统一的 Supabase client + 已认证用户对象。

## 对外接口

### Server Actions（`server/auth.ts`）

| 函数 | 入参 | 说明 |
|---|---|---|
| `signUp(data)` | `unknown`（内部 Zod 校验） | 注册新用户 |
| `signIn(data)` | `unknown` | 邮箱密码登录 |
| `signOut()` | 无 | 退出并清除 session |
| `resetPasswordEmail(email, locale)` | `unknown, string` | 发送重置密码邮件 |
| `updatePassword(newPassword)` | `unknown` | 用新密码完成重置 |
| `changePassword(currentPassword, newPassword)` | `string, string` | 已登录状态下修改密码 |

### 共享 Helper（`server/auth-helper.ts`）

```ts
getAuthSession(): Promise<{ supabase: SupabaseClient; user: User }>
```

**其他所有 feature 的 server actions 必须通过此函数获取 supabase client 和当前用户，禁止自行创建 client。**

### UI 组件

`<SignInForm>` / `<SignUpForm>` / `<ForgotPasswordForm>` / `<ResetPasswordForm>` / `<GoogleButton>` / `<AuthLayoutWrapper>`

## 依赖关系

```
auth
├── 外部：Supabase Auth、Zod
└── 内部：无（其他所有功能依赖本模块，本模块不依赖任何业务功能）
```

## 安全原则

- 入参类型为 `unknown`，服务端 Zod 二次校验后才使用
- 错误信息不透传 Supabase 原始 message，防止信息泄露
- 使用 `result.data`（Zod 净化后），不透传原始 `formData`
