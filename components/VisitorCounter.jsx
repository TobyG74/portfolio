"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [display, setDisplay] = useState(0);
  const done = useRef(false);
  const pathname = usePathname();

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

  // it would sit on top of the world's TALK button
  if (pathname === "/world") return null;

  return (
    <div
      className="visitor-counter"
      aria-label={count == null ? "Jumlah pengunjung belum tersedia" : `${count} pengunjung`}
    >
      <span>visitors</span>
      <span className="tabular-nums text-fg">
        {count == null ? "····" : display.toLocaleString("en-US")}
      </span>
    </div>
  );
}
