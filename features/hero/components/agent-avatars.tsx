"use client";

import { motion } from "motion/react";

const agents = [
  { initial: "B", name: "Buffett", bg: "bg-stone-700" },
  { initial: "L", name: "Lynch",   bg: "bg-stone-800" },
  { initial: "W", name: "Wood",    bg: "bg-amber-800" },
  { initial: "B", name: "Burry",   bg: "bg-stone-900" },
  { initial: "D", name: "Dalio",   bg: "bg-amber-900" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function AgentAvatars() {
  return (
    <section className="py-20 px-6 bg-[#f5f0e8]">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          className="text-stone-500 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Powered by 5 legendary investor strategies
        </motion.p>
        <motion.div
          className="flex justify-center gap-8 flex-wrap"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {agents.map((agent) => (
            <motion.div
              key={agent.name}
              variants={item}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-16 h-16 rounded-full ${agent.bg} ring-2 ring-[#c9a84c] flex items-center justify-center text-white text-xl font-bold`}
              >
                {agent.initial}
              </div>
              <span className="text-sm text-stone-600">{agent.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
