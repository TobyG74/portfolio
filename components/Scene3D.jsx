"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* The canvas wrapper is pointer-events:none so the page stays clickable,
   which means R3F's own pointer state never updates. Track the cursor on
   window instead and feed normalized [-1, 1] coords into the scene. */
function useGlobalPointer() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return ref;
}

const N = 90; // node count
const MAX_LINES = 800; // line-segment cap
const CONNECT = 3.4; // node-to-node link distance
const CURSOR_CONNECT = 5.0; // cursor link distance
const BOUND = { x: 10.5, y: 6, z: 4 };

/* ---- Constellation network that wires itself to the cursor ---- */
function Plexus({ pointer }) {
  const cursor = useRef(new THREE.Vector3(0, 0, 0));

  const sim = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * BOUND.x;
      pos[i * 3 + 1] = (Math.random() * 2 - 1) * BOUND.y;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * BOUND.z;
      vel[i * 3] = (Math.random() * 2 - 1) * 0.012;
      vel[i * 3 + 1] = (Math.random() * 2 - 1) * 0.012;
      vel[i * 3 + 2] = (Math.random() * 2 - 1) * 0.012;
    }
    return { pos, vel };
  }, []);

  const pointGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(sim.pos, 3));
    return g;
  }, [sim]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_LINES * 6), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(MAX_LINES * 6), 3));
    return g;
  }, []);

  useFrame((state) => {
    const { pos, vel } = sim;

    // map pointer to a point on the z=0 plane (matches the camera framing)
    cursor.current.set(pointer.current.x * BOUND.x, pointer.current.y * BOUND.y, 0);

    // integrate node motion
    for (let i = 0; i < N; i++) {
      const ix = i * 3;
      pos[ix] += vel[ix];
      pos[ix + 1] += vel[ix + 1];
      pos[ix + 2] += vel[ix + 2];

      if (pos[ix] > BOUND.x || pos[ix] < -BOUND.x) vel[ix] *= -1;
      if (pos[ix + 1] > BOUND.y || pos[ix + 1] < -BOUND.y) vel[ix + 1] *= -1;
      if (pos[ix + 2] > BOUND.z || pos[ix + 2] < -BOUND.z) vel[ix + 2] *= -1;

      // soft pull toward the cursor when nearby
      const dx = cursor.current.x - pos[ix];
      const dy = cursor.current.y - pos[ix + 1];
      const dz = cursor.current.z - pos[ix + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      if (d < 6) {
        const f = 0.0009 * (1 - d / 6);
        vel[ix] += (dx / d) * f;
        vel[ix + 1] += (dy / d) * f;
        vel[ix + 2] += (dz / d) * f;
      }
      // mild damping keeps it calm
      vel[ix] *= 0.998;
      vel[ix + 1] *= 0.998;
      vel[ix + 2] *= 0.998;
    }
    pointGeo.attributes.position.needsUpdate = true;

    // rebuild connection lines
    const lp = lineGeo.attributes.position.array;
    const lc = lineGeo.attributes.color.array;
    let s = 0;

    for (let i = 0; i < N && s < MAX_LINES; i++) {
      const ax = pos[i * 3], ay = pos[i * 3 + 1], az = pos[i * 3 + 2];
      for (let j = i + 1; j < N && s < MAX_LINES; j++) {
        const bx = pos[j * 3], by = pos[j * 3 + 1], bz = pos[j * 3 + 2];
        const dx = ax - bx, dy = ay - by, dz = az - bz;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < CONNECT) {
          const a = 1 - d / CONNECT;
          const o = s * 6;
          lp[o] = ax; lp[o + 1] = ay; lp[o + 2] = az;
          lp[o + 3] = bx; lp[o + 4] = by; lp[o + 5] = bz;
          const r = 0.22 * a, g = 0.92 * a, b = 0.86 * a; // aqua
          lc[o] = r; lc[o + 1] = g; lc[o + 2] = b;
          lc[o + 3] = r; lc[o + 4] = g; lc[o + 5] = b;
          s++;
        }
      }
    }

    // cursor links (violet, brighter)
    const cx = cursor.current.x, cy = cursor.current.y, cz = cursor.current.z;
    for (let i = 0; i < N && s < MAX_LINES; i++) {
      const ax = pos[i * 3], ay = pos[i * 3 + 1], az = pos[i * 3 + 2];
      const dx = ax - cx, dy = ay - cy, dz = az - cz;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < CURSOR_CONNECT) {
        const a = 1 - d / CURSOR_CONNECT;
        const o = s * 6;
        lp[o] = ax; lp[o + 1] = ay; lp[o + 2] = az;
        lp[o + 3] = cx; lp[o + 4] = cy; lp[o + 5] = cz;
        const r = 0.62 * a, g = 0.48 * a, b = 1.0 * a;
        lc[o] = r; lc[o + 1] = g; lc[o + 2] = b;
        lc[o + 3] = r; lc[o + 4] = g; lc[o + 5] = b;
        s++;
      }
    }

    lineGeo.setDrawRange(0, s * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  });

  return (
    <group>
      <points geometry={pointGeo}>
        <pointsMaterial
          color="#5ffbf1"
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* ---- Cursor-driven camera parallax ---- */
function CameraRig({ pointer }) {
  useFrame((state) => {
    const cam = state.camera;
    cam.position.x += (pointer.current.x * 1.2 - cam.position.x) * 0.04;
    cam.position.y += (pointer.current.y * 0.9 - cam.position.y) * 0.04;
    cam.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D() {
  const pointer = useGlobalPointer();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 13], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Plexus pointer={pointer} />
          <CameraRig pointer={pointer} />
          <fog attach="fog" args={["#04060a", 11, 26]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
