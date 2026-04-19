// 中间件：路由守卫 + Session 续期
//
// 职责：
//   1. 在每次请求时刷新 Supabase session（防止 JWT 过期导致登录失效）
//   2. 拦截未登录用户，强制跳转到 /sign-in

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 必须先初始化 response，后续写 cookie 才有地方存
  let supabaseResponse = NextResponse.next({
    request,
  });

  //直接操作 request/response 对象上的 cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

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

  //身份验证
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 未登录 且 访问的不是公开页面 → 重定向到登录页
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split("/")[1] || "ja";
  if (
    !user &&
    !pathname.includes("/sign-in") &&
    !pathname.includes("/sign-up") &&
    !pathname.startsWith("/auth/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
