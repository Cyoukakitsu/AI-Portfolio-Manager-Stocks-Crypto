import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const i18nResponse = handleI18nRouting(request);

  // next-intl がリダイレクト（/ → /ja/）を発行した場合はそのまま返す
  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }

  // Supabase session 更新 + 認証ガード
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
