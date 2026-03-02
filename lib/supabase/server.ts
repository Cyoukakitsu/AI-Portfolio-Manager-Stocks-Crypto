// 服务端 Supabase 客户端（Server Client）
//
// 用于 Server Components、Server Actions 和 API Routes。
// 每次请求都需要重新创建实例（因为每次请求的 cookie 上下文不同），
// 所以这里导出的是工厂函数而非单例。

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // cookies() 是 Next.js 提供的服务端 cookie 读取 API，必须在异步上下文中调用
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // setAll 在 Server Action 中刷新 session 时会被调用
        // try/catch 是因为 Server Component 渲染时 cookie 是只读的，
        // 写入会抛出异常，这里静默忽略即可（Middleware 会负责实际刷新）
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            //ignore error
          }
        },
      },
    },
  );
}
