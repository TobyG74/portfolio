"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Globe,
  Smartphone,
  Database,
  Wrench,
  SquareCode,
  MonitorCog,
} from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { skills } from "@/lib/content";

const ICONS = {
  "programming-languages": Code2,
  "web-development": Globe,
  "mobile-development": Smartphone,
  databases: Database,
  "tools-platforms": Wrench,
  "editors-ides": SquareCode,
  "operating-systems": MonitorCog,
};

export default function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-5xl px-5 py-28 sm:px-8">
      <SectionHeading
        index="01"
        eyebrow="Capabilities"
        title="Tech stack & tools."
        sub="Bahasa, framework, dan tools yang gue pakai sehari-hari buat ngebangun produk dari nol sampai produksi."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.categories.map((cat, i) => {
          const Icon = ICONS[cat.id] || Code2;
          return (
            <Reveal key={cat.id} delay={(i % 3) * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-2xl glass-strong hairline p-5"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-aqua/10 blur-2xl transition-opacity group-hover:bg-aqua/20" />
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-aqua/30 bg-aqua/10 text-aqua">
                    <Icon size={18} />
                  </span>
                  <h3 className="font-display text-base font-semibold text-white">{cat.label}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((it) => (
                    <span
                      key={it.name}
                      className="rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1 font-mono text-[0.72rem] text-ghost transition-colors hover:border-violet/40 hover:text-white"
                    >
                      {it.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
