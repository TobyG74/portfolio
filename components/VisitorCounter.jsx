"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [display, setDisplay] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/visitors")
      .then((r) => r.json())
      .then((d) => {
        if (alive && typeof d.count === "number") setCount(d.count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // count-up animation when the value arrives
  useEffect(() => {
    if (count == null || done.current) return;
    done.current = true;
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * count));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full glass-strong hairline px-3.5 py-2 font-mono text-xs shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)]"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" />
      </span>
      <span className="hidden uppercase tracking-wider text-ghost/60 sm:inline">Visitors</span>
      <span className="tabular-nums text-aqua">
        {count == null ? "····" : display.toLocaleString("en-US")}
      </span>
    </motion.div>
  );
}
