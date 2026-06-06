"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { projects } from "@/lib/content";

const VISIBLE = 2; // neighbours rendered on each side

/** transform preset per distance from the active card */
function presetFor(offset) {
  const dir = Math.sign(offset);
  const abs = Math.abs(offset);
  if (abs > VISIBLE) {
    return { x: `${dir * 130}%`, scale: 0.6, rotateY: -dir * 50, opacity: 0, z: 0, blur: 8 };
  }
  if (abs === 0) return { x: "0%", scale: 1, rotateY: 0, opacity: 1, z: 40, blur: 0 };
  if (abs === 1) return { x: `${dir * 62}%`, scale: 0.82, rotateY: -dir * 38, opacity: 0.7, z: 20, blur: 1.5 };
  return { x: `${dir * 108}%`, scale: 0.68, rotateY: -dir * 46, opacity: 0.4, z: 10, blur: 4 };
}

function HoloCard({ project, active }) {
  return (
    <div
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-3xl glass-strong transition-shadow duration-500 ${
        active ? "glow-aqua" : ""
      }`}
      style={{ border: "1px solid rgba(95,251,241,0.18)" }}
    >
      {/* animated holographic border sheen */}
      {active && (
        <span className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 [background:linear-gradient(130deg,transparent_30%,rgba(95,251,241,0.25),rgba(157,123,255,0.25),transparent_70%)]" />
      )}

      {/* HUD corner brackets */}
      {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-l border-b", "right-3 bottom-3 border-r border-b"].map(
        (pos) => (
          <span key={pos} className={`pointer-events-none absolute h-5 w-5 rounded-[3px] border-aqua/60 ${pos}`} />
        )
      )}

      {/* image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 90vw, 560px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        {/* scanline sweep */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 animate-scan bg-gradient-to-b from-aqua/15 to-transparent" />
        {/* faint scan grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(95,251,241,0.5) 0 1px, transparent 1px 4px)" }}
        />
      </div>

      {/* body */}
      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-violet">
              {project.tags[0]}
            </span>
            <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
              {project.title}
            </h3>
          </div>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${project.title}`}
            tabIndex={active ? 0 : -1}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-ghost transition-all hover:border-aqua/50 hover:bg-aqua hover:text-void"
          >
            <ArrowUpRight size={16} />
          </a>
        </div>

        <p className="text-sm leading-relaxed text-ghost line-clamp-3">{project.description}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {project.tags.map((t) => (
            <span
              key={t}
              className="rounded border border-white/8 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-aqua/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [active, setActive] = useState(0);
  const count = projects.length;

  const go = useCallback(
    (dir) => setActive((p) => (p + dir + count) % count),
    [count]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section id="work" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          index="02"
          eyebrow="Selected work"
          title="Proyek pilihan."
          sub="Beberapa proyek dipakai ribuan orang, beberapa lahir dari rasa penasaran."
        />
      </div>

      {/* ---- holographic stage ---- */}
      <div className="relative">
        {/* projector glow + grid floor */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 grid-floor animate-grid-pan opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[680px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aqua/10 blur-[90px]" />

        <div
          className="relative mx-auto h-[440px] w-full select-none overflow-hidden sm:h-[460px]"
          style={{ perspective: "1600px" }}
        >
          {projects.map((project, i) => {
            // shortest circular offset so the carousel wraps both ways
            let offset = i - active;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            const p = presetFor(offset);
            const isActive = offset === 0;

            return (
              <motion.div
                key={project.id}
                className="absolute left-1/2 top-0 h-full w-[clamp(280px,82vw,520px)]"
                style={{ transformStyle: "preserve-3d", marginLeft: "calc(clamp(280px,82vw,520px) / -2)" }}
                animate={{
                  x: p.x,
                  scale: p.scale,
                  rotateY: p.rotateY,
                  opacity: p.opacity,
                  zIndex: p.z,
                  filter: `blur(${p.blur}px)`,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -80) go(1);
                  else if (info.offset.x > 80) go(-1);
                }}
                onClick={() => !isActive && setActive(i)}
                role={isActive ? undefined : "button"}
                aria-hidden={Math.abs(offset) > VISIBLE}
              >
                <div className={isActive ? "h-full cursor-grab active:cursor-grabbing" : "h-full cursor-pointer"}>
                  <HoloCard project={project} active={isActive} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ---- controls ---- */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-between gap-6">
          <button
            onClick={() => go(-1)}
            aria-label="Previous project"
            className="flex h-12 w-12 items-center justify-center rounded-full glass hairline text-ghost transition-all hover:border-aqua/50 hover:text-aqua hover:glow-aqua"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex flex-col items-center gap-3">
            <div className="font-mono text-sm tracking-widest text-ghost">
              <span className="text-aqua">{String(active + 1).padStart(2, "0")}</span>
              <span className="text-ghost/40"> / {String(count).padStart(2, "0")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  aria-label={`Go to project ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-6 bg-aqua" : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Next project"
            className="flex h-12 w-12 items-center justify-center rounded-full glass hairline text-ghost transition-all hover:border-aqua/50 hover:text-aqua hover:glow-aqua"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* active project title ticker */}
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-center font-mono text-xs uppercase tracking-[0.3em] text-ghost/50"
          >
            ◇ {projects[active].title} ◇
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
