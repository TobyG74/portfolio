"use client";

import { useEffect, useRef } from "react";

/**
 * Splits text into per-letter spans whose variable-font weight and position
 * react to the cursor: letters near the pointer get heavier and lean away,
 * creating a magnetic / holographic ripple as the mouse passes over the word.
 */
export default function InteractiveText({
  text,
  className = "",
  radius = 220,
  minWeight = 300,
  maxWeight = 900,
  magnet = 8,
  gradient = false,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch

    const letters = Array.from(root.querySelectorAll("[data-letter]"));
    let raf = 0;

    const update = (mx, my) => {
      for (const el of letters) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.hypot(dx, dy);
        const t = Math.max(0, 1 - dist / radius); // 1 = on top, 0 = far
        const eased = t * t;
        const weight = Math.round(minWeight + eased * (maxWeight - minWeight));
        el.style.fontVariationSettings = `'wght' ${weight}`;
        // transforms only apply to inline-block letters (non-gradient word)
        if (!gradient) {
          const len = dist || 1;
          const push = eased * magnet;
          el.style.transform = `translate(${(dx / len) * push}px, ${(dy / len) * push}px)`;
        }
      }
    };

    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => update(e.clientX, e.clientY));
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      for (const el of letters) {
        el.style.fontVariationSettings = `'wght' ${minWeight}`;
        el.style.transform = "translate(0,0)";
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [text, radius, minWeight, maxWeight, magnet, gradient]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} aria-hidden> </span>
        ) : (
          <span
            key={i}
            data-letter
            aria-hidden
            style={{
              display: gradient ? "inline" : "inline-block",
              fontVariationSettings: `'wght' ${minWeight}`,
              transition: "font-variation-settings 0.25s ease, transform 0.25s ease",
              willChange: "font-variation-settings, transform",
            }}
          >
            {ch}
          </span>
        )
      )}
    </span>
  );
}
