"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { GLASS_CARD } from "../constants";

const features = [
  {
    id: "portfolio",
    image: "/Portfolio-Page.png",
    title: "Portfolio Overview",
    description:
      "See your total net worth, asset breakdown, and portfolio diversity score across stocks, crypto, and cash in one view.",
  },
  {
    id: "ai",
    image: "/AI-Agent-Analysis.png",
    title: "AI Agent Analysis",
    description:
      "Get investment insights from 5 legendary investor AI agents — Buffett, Lynch, Wood, Burry, and Dalio — debating your portfolio.",
  },
  {
    id: "stock",
    image: "/Stock-Page.png",
    title: "Stock Market",
    description:
      "Browse and search global stocks with real-time quotes, price charts, and key market data to inform your next investment decision.",
  },
  {
    id: "crypto",
    image: "/Crypto-Page.png",
    title: "Crypto Market",
    description:
      "Explore Bitcoin, Ethereum, and hundreds of altcoins with live prices, market cap rankings, and trend indicators.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-[#f5f0e8]">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center text-stone-800 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Core Features
        </motion.h2>
        <motion.p
          className="text-stone-500 text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Everything you need to manage and grow your investments.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              className={`${GLASS_CARD} overflow-hidden`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative w-full aspect-video bg-stone-100">
                <Image
                  src={f.image}
                  alt={f.title}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-stone-800 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
