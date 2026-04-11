"use client";

import { motion } from "motion/react";

const AuthLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default AuthLayoutWrapper;
