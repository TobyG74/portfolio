"use client";

import { useEffect, useRef, useState } from "react";

const ORBS = [
  { size: 320, top: "-2%", left: "4%", delay: "0s", duration: "24s" },
  { size: 220, top: "20%", right: "10%", delay: "-6s", duration: "28s" },
  { size: 280, bottom: "10%", left: "18%", delay: "-11s", duration: "30s" },
  { size: 180, bottom: "2%", right: "14%", delay: "-3s", duration: "22s" },
];

const PIXELS = new Array(30).fill(0).map((_, index) => ({
  id: index,
  top: `${(index * 37) % 100}%`,
  left: `${(index * 29) % 100}%`,
  delay: `${(index % 11) * 0.45}s`,
  duration: `${3.8 + (index % 7) * 0.75}s`,
  size: `${2 + (index % 3) * 1.4}px`,
  alpha: 0.4 + ((index % 5) * 0.13),
}));

export default function AmbientEffects() {
  const [meteors, setMeteors] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawnMeteor = () => {
      idRef.current += 1;
      const meteor = {
        id: idRef.current,
        top: `${-8 + Math.random() * 26}vh`,
        right: `${-4 + Math.random() * 22}vw`,
        duration: `${1.35 + Math.random() * 0.95}s`,
        dx: `${-64 - Math.random() * 92}vw`,
        dy: `${92 + Math.random() * 54}vh`,
        rot: `${126 + Math.random() * 20}deg`,
      };

      setMeteors((prev) => [...prev.slice(-8), meteor]);

      const lifetimeMs = (parseFloat(meteor.duration) + 0.25) * 1000;
      setTimeout(() => {
        setMeteors((prev) => prev.filter((item) => item.id !== meteor.id));
      }, lifetimeMs);
    };

    spawnMeteor();

    let timer;
    const loop = () => {
      spawnMeteor();
      const next = 980 + Math.random() * 1700;
      timer = setTimeout(loop, next);
    };

    timer = setTimeout(loop, 1100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {ORBS.map((orb, index) => (
          <span
            key={`orb-${index}`}
            className="orb"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom,
              animationDelay: orb.delay,
              animationDuration: orb.duration,
            }}
          />
        ))}
        {PIXELS.map((pixel) => (
          <span
            key={`pixel-${pixel.id}`}
            className="pixel"
            style={{
              top: pixel.top,
              left: pixel.left,
              animationDelay: pixel.delay,
              animationDuration: pixel.duration,
              width: pixel.size,
              height: pixel.size,
              opacity: pixel.alpha,
            }}
          />
        ))}
        {meteors.map((meteor) => (
          <span
            key={`meteor-${meteor.id}`}
            className="meteor"
            style={{
              top: meteor.top,
              right: meteor.right,
              animationDuration: meteor.duration,
              "--meteor-dx": meteor.dx,
              "--meteor-dy": meteor.dy,
              "--meteor-rot": meteor.rot,
            }}
          />
        ))}
      </div>
    </>
  );
}
