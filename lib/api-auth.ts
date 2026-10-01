// route handler 的身份校验：未登录返回 401 响应，已登录返回 null
// 必须在任何外部调用（AI、行情、新闻）之前执行，避免匿名请求消耗额度
import { createClient } from "@/lib/supabase/server";

export async function rejectIfUnauthenticated(): Promise<Response | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
}
