"use client";

import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FESTIVAL_TITLE } from "@/lib/festival";

/**
 * Birthday decorations for the plaza, built from primitives rather than new
 * assets: poles with lanterns, bunting strung between them, and a tiered cake
 * with candles at the centre. ponytail: no pack has party props, and geometry
 * this simple is cheaper to write than to source.
 */

const POLES = 12;
const RING = 11.5; // radius of the lantern circle, inside the plaza
const LANTERN_COLORS = ["#ffc93c", "#ff4fd8", "#22e8ff", "#a6ff3d"];

const POLE_TOP = 3.2;

function Lanterns() {
  const group = useRef();

  const poles = useMemo(
    () =>
      Array.from({ length: POLES }, (_, i) => {
        const a = (i / POLES) * Math.PI * 2;
        return {
          x: Math.cos(a) * RING,
          z: Math.sin(a) * RING,
          angle: a,
          color: LANTERN_COLORS[i % LANTERN_COLORS.length],
        };
      }),
    []
  );

  /**
   * Garlands are built from the two pole tops they actually join, rather than
   * each pole carrying its own stub. The old version pointed each stub along
   * the circle's TANGENT while the next pole sits along the CHORD, 15 degrees
   * away at twelve poles, so no two ends ever met and the ring read as a row
   * of separate posts.
   */
  const spans = useMemo(
    () =>
      poles.map((p, i) => {
        const next = poles[(i + 1) % poles.length];
        const dx = next.x - p.x;
        const dz = next.z - p.z;
        return {
          mid: [(p.x + next.x) / 2, (p.z + next.z) / 2],
          length: Math.hypot(dx, dz),
          yaw: Math.atan2(dx, dz),
          from: p,
        };
      }),
    [poles]
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // lanterns breathe, slightly out of phase so the ring shimmers
    g.children.forEach((child, i) => {
      const lamp = child.getObjectByName("lamp");
      if (lamp) lamp.scale.setScalar(1 + Math.sin(t * 2 + i * 0.7) * 0.08);
    });
  });

  return (
    <>
      <group ref={group}>
        {poles.map((p, i) => (
          <group key={i} position={[p.x, 0, p.z]} rotation={[0, -p.angle, 0]}>
            {/* a plinth, so the pole reads as planted instead of floating */}
            <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.36, 0.24, 8]} />
              <meshStandardMaterial color="#4a3d2e" roughness={1} />
            </mesh>
            <mesh position={[0, POLE_TOP / 2 + 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, POLE_TOP, 6]} />
              <meshStandardMaterial color="#5a4432" roughness={1} />
            </mesh>
            {/* the hook the garland hangs from; rotation belongs on the mesh,
                a BufferGeometry has no rotation of its own */}
            <mesh position={[0, POLE_TOP + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.12, 0.03, 6, 10]} />
              <meshStandardMaterial color="#3f342a" roughness={1} />
            </mesh>
            <mesh name="lamp" position={[0, POLE_TOP + 0.52, 0]}>
              <sphereGeometry args={[0.26, 12, 10]} />
              <meshStandardMaterial
                color={p.color}
                emissive={p.color}
                emissiveIntensity={1.4}
                roughness={0.4}
              />
            </mesh>
          </group>
        ))}
      </group>

      {spans.map((s, i) => (
        <group key={i} position={[s.mid[0], POLE_TOP + 0.18, s.mid[1]]} rotation={[0, s.yaw, 0]}>
          <mesh>
            <boxGeometry args={[0.045, 0.045, s.length]} />
            <meshStandardMaterial color="#6b5a44" roughness={1} />
          </mesh>
          {/* flags hung along the span, pointing down */}
          {[-0.34, -0.12, 0.12, 0.34].map((k, j) => (
            <mesh key={j} position={[0, -0.2, s.length * k]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.15, 0.32, 4]} />
              <meshStandardMaterial
                color={LANTERN_COLORS[(i + j) % LANTERN_COLORS.length]}
                roughness={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

function Cake({ position }) {
  const flames = useRef();

  const candles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return [Math.cos(a) * 0.62, Math.sin(a) * 0.62];
      }),
    []
  );

  useFrame((state) => {
    const g = flames.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((f, i) => {
      f.scale.set(1, 1 + Math.sin(t * 9 + i) * 0.28, 1);
    });
  });

  return (
    <group position={position}>
      {/* three tiers */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 0.7, 24]} />
        <meshStandardMaterial color="#f4e2c8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[1.52, 1.52, 0.12, 24]} />
        <meshStandardMaterial color="#ff8fbf" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.7, 24]} />
        <meshStandardMaterial color="#f4e2c8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.52, 0]} castShadow>
        <cylinderGeometry args={[1.07, 1.07, 0.12, 24]} />
        <meshStandardMaterial color="#ff8fbf" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.7, 20]} />
        <meshStandardMaterial color="#f4e2c8" roughness={0.9} />
      </mesh>

      {candles.map(([x, z], i) => (
        <mesh key={i} position={[x, 2.42, z]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.34, 6]} />
          <meshStandardMaterial color="#fff3d6" roughness={0.8} />
        </mesh>
      ))}
      <group ref={flames}>
        {candles.map(([x, z], i) => (
          <mesh key={i} position={[x, 2.66, z]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color="#ffd88a"
              emissive="#ffab2e"
              emissiveIntensity={2.2}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      <pointLight position={[0, 3, 0]} intensity={45} distance={16} color="#ffb454" />

      <Html
        center
        position={[0, 4.1, 0]}
        distanceFactor={18}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="world-label bg-primary px-3 py-2 text-center font-pixel text-xs text-text">
          🎂 {FESTIVAL_TITLE}
        </div>
      </Html>
    </group>
  );
}

export default function Festival({ cakeAt = [0, 0, 3] }) {
  return (
    <group>
      <Lanterns />
      <Cake position={cakeAt} />
    </group>
  );
}
