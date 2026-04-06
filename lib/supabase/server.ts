// Supabase服务端工厂函数
//功能：让 Supabase 在 Node.js 环境下能够“感知”并“操作”浏览器的 Cookie
//参考：https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs

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
        //getAll:读取Cookie
        //在服务端调用 supabase.auth.getUser()等方法时，Supabase会通过 getAll 这个方法读取请求头中的Cookie
        getAll() {
          return cookieStore.getAll();
        },
        //setAll:设置Cookie
        //在服务端调用 supabase.auth.signUp()等方法后，Supabase会通过 setAll 这个方法设置响应头中的Cookie
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
