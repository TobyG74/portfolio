"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

export default function SceneMount() {
  const [ready, setReady] = useState(false);

  // mount only on client, after first paint, to keep the initial load light
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) return null;
  return <Scene3D />;
}
