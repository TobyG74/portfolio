"use client";

import dynamic from "next/dynamic";

// three + drei are client-only, and the world is heavy enough to keep off the
// initial bundle of every other page
const RpgWorld = dynamic(() => import("./RpgWorld"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-void">
      <p className="animate-blink font-pixel text-[0.7rem] text-aqua">LOADING WORLD…</p>
    </div>
  ),
});

export default function WorldMount() {
  return <RpgWorld />;
}
