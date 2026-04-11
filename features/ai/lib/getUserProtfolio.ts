//AI 工具定义文件 —— 让 AI 查询用户supabase 的数据

import { tool } from "ai";
import z from "zod";
import { createClient } from "@/lib/supabase/server";

export const getUserProtfolio = tool({
  description:
    "Get the current user's portfolio holdings including all assets, quantities and average cost.",
  inputSchema: z.object({}),
  execute: async () => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", user?.id);

    if (error) throw new Error(error.message);
    return data;
  },
});
