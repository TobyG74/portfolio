"use client";

import { useEffect, useRef } from "react";

/**
 * Two cursor-driven layers painted over the whole page:
 *  - a soft holographic spotlight that tracks the pointer exactly
 *  - a ring that eases toward the pointer (a custom cursor) and grows
 *    when hovering interactive elements.
 * Disabled on touch devices.
 */
export default function CursorFX() {
  const glow = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let visible = false;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        if (glow.current) glow.current.style.opacity = "1";
        if (ring.current) ring.current.style.opacity = "1";
      }
      if (glow.current) {
        glow.current.style.setProperty("--mx", `${e.clientX}px`);
        glow.current.style.setProperty("--my", `${e.clientY}px`);
      }
    };

    const onOver = (e) => {
      const interactive = e.target.closest("a, button, [role='button'], input, textarea");
      if (ring.current) ring.current.dataset.hover = interactive ? "true" : "false";
    };

    const onLeave = () => {
      visible = false;
      if (glow.current) glow.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* spotlight */}
      <div
        ref={glow}
        className="pointer-events-none fixed inset-0 z-40 opacity-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(95,251,241,0.10), rgba(157,123,255,0.06) 40%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      {/* custom cursor ring */}
      <div
        ref={ring}
        data-hover="false"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-8 w-8 rounded-full border border-aqua/70 opacity-0 transition-[width,height,background-color,border-color] duration-200 [box-shadow:0_0_18px_-4px_rgba(95,251,241,0.8)] data-[hover=true]:h-12 data-[hover=true]:w-12 data-[hover=true]:border-violet/70 data-[hover=true]:bg-violet/10 md:block"
      />
    </>
  );
}
