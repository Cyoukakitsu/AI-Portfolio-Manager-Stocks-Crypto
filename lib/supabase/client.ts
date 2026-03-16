// 浏览器端 Supabase 客户端（Browser Client）
//
//参考：https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs
// 专门用于客户端组件（"use client"）中调用 Supabase。
// 与 server.ts 的区别：这里读写的是浏览器 cookie，
// 而 server.ts 通过 Next.js 的 cookies() API 操作服务端 cookie。
// 两者不能混用，否则会在 Server Component 中意外读取到过期会话。

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
