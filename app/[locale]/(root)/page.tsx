"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const Home = () => {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted gap-8 px-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <Image
          src="/hero-illustration.svg"
          alt="Logo"
          width={680}
          height={380}
          className="w-full h-auto"
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
        <p className="text-muted-foreground">{t("tagline")}</p>
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
          {t("signIn")}
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-2 border border-border text-foreground font-semibold rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        >
          {t("signUp")}
        </Link>
      </motion.div>
    </main>
  );
};

export default Home;
