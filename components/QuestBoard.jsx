"use client";

import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { projects } from "@/lib/content";

/**
 * The notice board outside the guild hall. Built from primitives: two posts,
 * a plank, and a sheet of parchment per project pinned to it. Clicking it
 * opens the full list as a DOM panel, since 3D text at this distance is
 * unreadable and a wall of Html labels would be worse.
 */
export default function QuestBoard({ position = [0, 0, -18], rot = 0, near, onOpen }) {
  const glow = useRef();

  useFrame((state) => {
    if (!glow.current) return;
    // the pinned notices lift and settle, so the board reads as interactive
    glow.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  return (
    <group position={position} rotation={[0, rot, 0]} onClick={onOpen}>
      {/* posts */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.11, 0.13, 2.3, 6]} />
          <meshStandardMaterial color="#5a4432" roughness={1} />
        </mesh>
      ))}

      {/* backing plank */}
      <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 1.9, 0.16]} />
        <meshStandardMaterial color="#6b5334" roughness={0.95} />
      </mesh>

      {/* a small roof, so rain and the eye both slide off it */}
      <mesh position={[0, 3.2, 0]} rotation={[0.28, 0, 0]} castShadow>
        <boxGeometry args={[3.9, 0.12, 0.9]} />
        <meshStandardMaterial color="#4a3a26" roughness={1} />
      </mesh>

      {/* one pinned sheet per project, laid out in a grid on the plank */}
      <group ref={glow}>
        {projects.slice(0, 8).map((p, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          return (
            <mesh
              key={p.id ?? i}
              position={[-1.25 + col * 0.83, 0.22 - row * 0.62, 0.1]}
              rotation={[0, 0, (((i * 37) % 7) - 3) * 0.02]}
            >
              <planeGeometry args={[0.66, 0.5]} />
              <meshStandardMaterial
                color="#efe2c4"
                emissive={near ? "#ffc93c" : "#000000"}
                emissiveIntensity={near ? 0.35 : 0}
                roughness={0.9}
              />
            </mesh>
          );
        })}
      </group>

      <Html
        center
        position={[0, 3.9, 0]}
        distanceFactor={16}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`world-label px-2 py-1 text-center font-pixel text-xs ${
            near ? "bg-primary text-text" : "bg-void text-ghost"
          }`}
        >
          📜 PAPAN MISI
          {near && <span className="ml-2 animate-blink">TEKAN E</span>}
        </div>
      </Html>
    </group>
  );
}
