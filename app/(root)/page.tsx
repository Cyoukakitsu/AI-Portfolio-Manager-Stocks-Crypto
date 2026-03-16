"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted gap-8">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Image
          src="/header-icon.svg"
          alt="Logo"
          width={180}
          height={40}
          className="h-10 w-auto"
        />
      </motion.div>

      {/* 标题区域 */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
      >
        <h1 className="text-2xl font-semibold text-foreground">
          AI Portfolio Manager
        </h1>
        <p className="text-muted-foreground">
          Track your stocks and crypto with AI-powered insights.
        </p>
      </motion.div>

      {/* 按钮区域 */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      >
        <Link
          href="/sign-in"
          className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-2 border border-border text-foreground font-semibold rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        >
          Sign Up
        </Link>
      </motion.div>
    </main>
  );
};

export default Home;
