"use client";

import Reveal from "./Reveal";

export default function SectionHeading({ index, eyebrow, title, sub }) {
  return (
    <div className="mb-12 max-w-3xl text-center lg:text-left mx-auto lg:mx-0">
      <Reveal>
        <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
          <span className="font-mono text-sm text-violet">{index}</span>
          <span className="h-px w-10 bg-gradient-to-r from-aqua to-transparent" />
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-4 text-base leading-relaxed text-ghost">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
