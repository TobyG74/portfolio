"use client";

import { Github, Linkedin, Instagram, Mail, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { socials } from "@/lib/content";

const ICONS = { github: Github, linkedin: Linkedin, instagram: Instagram, mail: Mail };

export default function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-5xl px-5 py-28 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl glass hairline p-8 sm:p-14">
        {/* ambient glow + grid */}
        <div className="pointer-events-none absolute inset-0 grid-floor opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-aqua/20 blur-3xl" />

        <div className="relative text-center lg:text-left">
          <Reveal>
            <span className="eyebrow">Let&apos;s build something</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl mx-auto lg:mx-0">
              Punya ide? <span className="text-gradient">Ngobrol yuk.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ghost mx-auto lg:mx-0">
              Lagi cari developer buat proyek, kolaborasi open-source, atau sekadar mau nanya-nanya tinggal
              inbox gue selalu kebuka.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {socials.map((s, i) => {
              const Icon = ICONS[s.icon] || Mail;
              return (
                <Reveal key={s.title} delay={0.3 + i * 0.06}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-aqua/40 hover:bg-aqua/5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-ghost transition-colors group-hover:border-aqua/40 group-hover:text-aqua">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.62rem] uppercase tracking-wider text-ghost/60">
                        {s.title}
                      </span>
                      <span className="block truncate text-sm text-white">{s.value}</span>
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
