"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDownRight, Github } from "lucide-react";
import { profile, stats, socials } from "@/lib/content";
import InteractiveText from "./InteractiveText";
import TypedRoles from "./TypedRoles";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

export default function About() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden px-5 pb-20 pt-28 sm:px-8"
    >
      {/* holographic grid floor */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 h-[55%] w-[140%] -translate-x-1/2 grid-floor animate-grid-pan" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]"
      >
        {/* ---- intro ---- */}
        <div className="text-center lg:text-left">
          <motion.div variants={item} className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-aqua" />
            </span>
            <span className="eyebrow">Software Engineer · Jakarta, ID</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-[2.7rem] font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-[5.4rem]"
          >
            <InteractiveText text="Tobi" className="mr-4 inline-block" />
            <InteractiveText text="Saputra" gradient magnet={0} className="text-gradient inline-block" />
          </motion.h1>

          <motion.div variants={item} className="mt-5 h-8 font-mono text-lg text-aqua sm:text-xl">
            <span className="text-ghost/60">{"// "}</span>
            <TypedRoles roles={profile.roles} />
          </motion.div>

          <motion.p variants={item} className="mt-7 max-w-xl text-base leading-relaxed text-ghost sm:text-lg mx-auto lg:mx-0">
            Halo, gue <span className="text-white">{profile.name}</span>, lebih dikenal sebagai{" "}
            <span className="font-mono text-aqua">@{profile.handle}</span>. Gue suka ngebongkar cara kerja
            sesuatu lalu ngebangun ulang jadi lebih baik: dari <span className="text-white">bot WhatsApp &amp; LINE</span>,{" "}
            <span className="text-white">API downloader</span> yang dipakai banyak developer, sampai{" "}
            <span className="text-white">aplikasi mobile</span> buat kampus.
          </motion.p>

          {/* stats */}
          <motion.div variants={item} className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="glass hairline rounded-xl p-4">
                <div className="font-display text-2xl font-bold text-gradient">{s.value}</div>
                <div className="mt-1 font-mono text-[0.64rem] uppercase tracking-wider text-ghost/70">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-xl bg-aqua px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-wider text-void transition-all hover:glow-aqua"
            >
              View my work
              <ArrowDownRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a
              href={"https://github.com/" + profile.handle}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-white transition-all hover:border-aqua/50 hover:text-aqua"
            >
              <Github size={18} />
              GitHub
            </a>
          </motion.div>

          {/* socials */}
          <motion.div variants={item} className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            {socials.map((s) => (
              <a
                key={s.title}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-ghost transition-all hover:border-aqua/40 hover:text-aqua"
              >
                {s.title}
              </a>
            ))}
          </motion.div>
        </div>

        {/* ---- avatar card ---- */}
        <motion.div variants={item} className="order-first lg:order-last">
          <div className="group relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-aqua/60 to-violet/60 opacity-50 blur transition-opacity group-hover:opacity-90" />
            <div className="glass-strong hairline relative overflow-hidden rounded-3xl p-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  sizes="384px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-aqua/15 to-transparent" />
              </div>
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="font-mono text-sm text-white">@{profile.alias}</p>
                  <p className="font-mono text-xs text-ghost/60">{profile.location}</p>
                </div>
                <span className="rounded-md border border-aqua/30 bg-aqua/10 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-wider text-aqua">
                  OPEN FOR PROJECTS
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <div className="flex h-12 w-7 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.span
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-aqua"
          />
        </div>
      </motion.div>
    </section>
  );
}
