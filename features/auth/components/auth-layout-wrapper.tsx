"use client";

// Auth 页面（登录/注册/重置密码）的公共布局容器：只做一次短淡入，并遵守 prefers-reduced-motion
import { MotionConfig, motion } from "motion/react";

const AuthLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
};

export default AuthLayoutWrapper;
