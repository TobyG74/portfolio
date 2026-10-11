"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import System, {
  Alpha,
  Body,
  BoxZone,
  Color,
  Emitter,
  Life,
  Mass,
  Position,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  Span,
  SphereZone,
  SpriteRenderer,
  Vector3D,
} from "three-nebula";

/** Soft round sprite drawn at runtime, so no texture file ships with it. */
function dotTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const sprite = (map) =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      fog: false,
    })
  );

/**
 * three-nebula particle system: an updraft inside the portal plus fireflies
 * drifting over the village. Runs on its own emitters and is updated from the
 * R3F frame loop.
 */
export default function PortalParticles({ portal }) {
  const [px, py, pz] = portal;
  const { scene } = useThree();
  const system = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let built = null;
    const map = dotTexture();

    try {
      const vortex = new Emitter()
        .setRate(new Rate(new Span(2, 5), new Span(0.04, 0.09)))
        .addInitializers([
          new Mass(1),
          new Radius(0.14, 0.34),
          new Life(1.1, 2.1),
          new Body(sprite(map)),
          new Position(new SphereZone(0, 0, 0, 1.5)),
          new RadialVelocity(1.7, new Vector3D(0, 1, 0), 55),
        ])
        .addBehaviours([new Alpha(0.95, 0), new Scale(1, 0.15), new Color("#22e8ff", "#ff4fd8")])
        .setPosition({ x: px, y: py, z: pz })
        .emit();

      const fireflies = new Emitter()
        .setRate(new Rate(new Span(1, 3), new Span(0.25, 0.5)))
        .addInitializers([
          new Mass(1),
          new Radius(0.06, 0.14),
          new Life(4, 8),
          new Body(sprite(map)),
          new Position(new BoxZone(0, 0, 0, 56, 5, 56)),
          new RadialVelocity(0.3, new Vector3D(0, 1, 0), 180),
        ])
        .addBehaviours([new Alpha(0.8, 0), new Scale(0.9, 0.4), new Color("#ffc93c", "#a6ff3d")])
        .setPosition({ x: 0, y: 3.2, z: 0 })
        .emit();

      built = new System();
      built.addEmitter(vortex).addEmitter(fireflies).addRenderer(new SpriteRenderer(scene, THREE));

      if (cancelled) built.destroy();
      else system.current = built;
    } catch (err) {
      // a particle layer is decoration: never let it take the world down
      console.error("three-nebula init failed", err);
    }

    return () => {
      cancelled = true;
      try {
        system.current?.destroy();
      } catch {}
      system.current = null;
      map.dispose();
    };
    // primitives, not the array, so a fresh literal from the parent cannot
    // tear the system down every render
  }, [scene, px, py, pz]);

  useFrame((_, dt) => {
    system.current?.update(dt);
  });

  return null;
}
