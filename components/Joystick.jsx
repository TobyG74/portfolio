"use client";

import { useRef, useState } from "react";

/**
 * On-screen analog stick. Writes a normalized {x, y} (y is +up) into vecRef
 * every pointermove — no React state reaches the render loop.
 */
export default function Joystick({ vecRef }) {
  const base = useRef(null);
  const active = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (e) => {
    const r = base.current.getBoundingClientRect();
    const R = (r.width - base.current.lastElementChild.offsetWidth) / 2 - 4;
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    setKnob({ x: dx, y: dy });
    vecRef.current = { x: dx / R, y: -dy / R };
  };

  const start = (e) => {
    active.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    update(e);
  };

  const move = (e) => {
    if (active.current === e.pointerId) update(e);
  };

  const end = (e) => {
    if (active.current !== e.pointerId) return;
    active.current = null;
    setKnob({ x: 0, y: 0 });
    vecRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={base}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      className="world-joystick relative h-32 w-32 touch-none select-none rounded-full border-[3px] border-black bg-void shadow-[4px_4px_0_#000]"
      aria-label="Analog stick"
    >
      {/* direction ticks */}
      <span className="pointer-events-none absolute inset-0 flex items-start justify-center pt-1.5 font-pixel text-[0.5rem] text-aqua/40">▲</span>
      <span className="pointer-events-none absolute inset-0 flex items-end justify-center pb-1.5 font-pixel text-[0.5rem] text-aqua/40">▼</span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-start pl-1.5 font-pixel text-[0.5rem] text-aqua/40">◀</span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-end pr-1.5 font-pixel text-[0.5rem] text-aqua/40">▶</span>

      <span
        className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-primary shadow-[4px_4px_0_#000]"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
