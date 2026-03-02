// 中间件：路由守卫 + Session 续期
//
// 职责：
//   1. 在每次请求时刷新 Supabase session（防止 JWT 过期导致登录失效）
//   2. 拦截未登录用户，强制跳转到 /sign-in
//
// 为什么不在页面组件里做鉴权？
//   中间件在边缘（Edge）运行，比页面渲染更早，能彻底避免未授权内容闪现（FOUC）

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 必须先初始化 response，后续写 cookie 才有地方存
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 中间件里无法使用 Next.js 的 cookies() API，
  // 必须直接操作 request/response 对象上的 cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // setAll 写两次 cookie 是官方要求：
        // 先写 request（让本次请求能读到新值），再写 response（让浏览器保存新值）
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() 比 getUser() 更轻量（不发网络请求，直接解析 JWT）
  // 适合中间件这类对延迟敏感的场景
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 未登录 且 访问的不是公开页面 → 重定向到登录页
  // 注意：/sign-in 和 /sign-up 必须放行，否则会造成重定向死循环
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/sign-in") &&
    !request.nextUrl.pathname.startsWith("/sign-up")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
