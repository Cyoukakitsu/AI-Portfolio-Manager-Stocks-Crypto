"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-[#f5f0e8]">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-8">
          Ready to Elevate Your Wealth with AIPM?
        </h2>
        <Link
          href="/sign-up"
          className="inline-block px-8 py-3 bg-[#c9a84c] text-white font-semibold rounded-lg hover:bg-[#b8973b] transition-colors"
        >
          Sign Up
        </Link>
      </motion.div>
    </section>
  );
}
