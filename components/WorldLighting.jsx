"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Instance, Instances, Sky } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { daylightAt, lampPosition } from "@/lib/daylight";
import { houses, landmarks } from "@/lib/npcs";

const LAMPS = [
  [3, 0, 7], [-3, 0, 15], [3, 0, -8], [-3, 0, -15],
  [-15, 0, 2.8], [15, 0, -2.8],
  ...[...houses, ...landmarks].map(lampPosition),
];

function StreetLights({ night, quality, playerPos }) {
  const lights = useRef([]);
  const nextUpdate = useRef(0);
  const glow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.4)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => glow.dispose(), [glow]);

  useFrame(({ clock }) => {
    if (clock.elapsedTime < nextUpdate.current) return;
    nextUpdate.current = clock.elapsedTime + 0.5;
    const player = playerPos.current;
    const nearest = [...LAMPS].sort((a, b) =>
      (a[0] - player.x) ** 2 + (a[2] - player.z) ** 2 -
      ((b[0] - player.x) ** 2 + (b[2] - player.z) ** 2)
    );
    lights.current.forEach((light, i) => {
      if (light) light.position.set(nearest[i][0], 3.65, nearest[i][2]);
    });
  });

  return (
    <group name="village-street-lights">
      <Instances frames={1} limit={LAMPS.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.11, 3.6, 6]} />
        <meshStandardMaterial color="#473c30" roughness={0.85} />
        {LAMPS.map(([x, , z], i) => <Instance key={i} position={[x, 1.8, z]} />)}
      </Instances>
      <Instances frames={1} limit={LAMPS.length} receiveShadow>
        <boxGeometry args={[0.4, 0.22, 0.4]} />
        <meshStandardMaterial color="#655f54" roughness={1} />
        {LAMPS.map(([x, , z], i) => <Instance key={i} position={[x, 0.11, z]} />)}
      </Instances>
      <Instances frames={1} limit={LAMPS.length}>
        <boxGeometry args={[0.48, 0.09, 0.48]} />
        <meshStandardMaterial color="#302e2a" roughness={0.65} />
        {LAMPS.map(([x, , z], i) => <Instance key={i} position={[x, 3.36, z]} />)}
      </Instances>
      <Instances frames={1} limit={LAMPS.length}>
        <boxGeometry args={[0.32, 0.5, 0.32]} />
        <meshStandardMaterial color="#ffe3a1" emissive="#ffbd58" emissiveIntensity={night * 2.5} roughness={0.4} />
        {LAMPS.map(([x, , z], i) => <Instance key={i} position={[x, 3.65, z]} />)}
      </Instances>
      <Instances frames={1} limit={LAMPS.length} castShadow>
        <coneGeometry args={[0.4, 0.28, 4]} />
        <meshStandardMaterial color="#302e2a" roughness={0.65} />
        {LAMPS.map(([x, , z], i) => <Instance key={i} position={[x, 4.04, z]} rotation={[0, Math.PI / 4, 0]} />)}
      </Instances>
      <Instances frames={1} limit={LAMPS.length}>
        <planeGeometry args={[11, 11]} />
        <meshBasicMaterial map={glow} color="#ffc879" transparent opacity={night * 0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
        {LAMPS.map(([x, , z], i) => <Instance key={i} position={[x, 0.035, z]} rotation={[-Math.PI / 2, 0, 0]} />)}
      </Instances>
      {Array.from({ length: quality.lights }, (_, i) => (
        <pointLight key={i} ref={(light) => { lights.current[i] = light; }} name={`street-light-${i}`} color="#ffca82" intensity={night * 45} distance={18} decay={2} />
      ))}
    </group>
  );
}

export default function WorldLighting({ quality, playerPos }) {
  const [cycle, setCycle] = useState(() => daylightAt());
  useEffect(() => {
    const sync = () => setCycle(daylightAt());
    const timer = setInterval(sync, 10000);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const { daylight, night, sunset, sun } = cycle;
  const skyColor = new THREE.Color("#101b30").lerp(new THREE.Color("#b8cdd0"), daylight).lerp(new THREE.Color("#bd8268"), sunset * 0.5);
  const sunColor = new THREE.Color("#ffe4b5").lerp(new THREE.Color("#ffae70"), sunset);

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, quality.fog[0], quality.fog[1]]} />
      <group name="real-time-lighting" userData={{ daylight, night }}>
        <Sky sunPosition={sun} turbidity={6} rayleigh={1.2} />
        <ambientLight intensity={0.12 + daylight * 0.53} />
        <hemisphereLight args={["#d6edff", "#526b39", 0.23 + daylight * 0.87]} />
        <directionalLight
          castShadow={quality.shadows}
          position={sun}
          color={sunColor}
          intensity={daylight * 2}
          shadow-bias={-0.0002}
          shadow-normalBias={0.04}
          shadow-mapSize={[quality.shadowMap, quality.shadowMap]}
          shadow-camera-left={-quality.shadowExtent}
          shadow-camera-right={quality.shadowExtent}
          shadow-camera-top={quality.shadowExtent}
          shadow-camera-bottom={-quality.shadowExtent}
        />
        <directionalLight position={[-sun[0], Math.max(20, -sun[1]), 35]} color="#abc9ff" intensity={night * 0.22} />
        <mesh position={[-sun[0] * 2, Math.max(40, -sun[1] * 2), 100]}>
          <sphereGeometry args={[2, 12, 8]} />
          <meshBasicMaterial color="#dce6ef" transparent opacity={night} fog={false} />
        </mesh>
        <StreetLights night={night} quality={quality} playerPos={playerPos} />
      </group>
    </>
  );
}
