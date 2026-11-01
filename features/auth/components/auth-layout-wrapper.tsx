"use client";

// Auth 页面（登录/注册/重置密码）的公共布局容器：只做一次短淡入，系统开启"减少动态效果"时不播放
import { motion } from "motion/react";

import { useFadeDuration } from "./auth-card";

const AuthLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const duration = useFadeDuration(0.25);
  return (
    <motion.div
      className="w-full max-w-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default AuthLayoutWrapper;
