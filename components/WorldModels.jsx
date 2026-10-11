"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Instance, Instances, useFBX, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import {
  ARM_REST,
  ARM_TWIST,
  angleTo,
  attackPose,
  makeFlasher,
  MODEL_YAW,
  normalize,
  rigCharacter,
} from "@/lib/autorig";

export { angleTo, MODEL_YAW };

/* ---------------- characters ---------------- */

export function Character({ url, height = 1.8, movingRef, walkCadence = 11, weapon, attackRef, hurtRef }) {
  const fbx = useFBX(url);
  const { object, joints, tPose } = useMemo(() => rigCharacter(fbx, height), [fbx, height]);
  const flash = useMemo(() => makeFlasher(object), [object]);
  const body = useRef();
  const stride = useRef(0);
  const speed = useRef(0);
  const slash = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    dt = Math.min(dt, 0.05);
    speed.current = THREE.MathUtils.damp(speed.current, Number(movingRef?.current || 0), 10, dt);
    stride.current += dt * walkCadence * speed.current;
    const { lift, sweep } = attackPose(attackRef?.current ?? 0);
    if (slash.current) {
      const progress = attackRef?.current ?? 0;
      slash.current.visible = progress > 0.32 && progress < 0.65;
      slash.current.material.opacity = Math.sin(Math.PI * Math.min(1, Math.max(0, (progress - 0.32) / 0.33))) * 0.65;
      slash.current.rotation.z = -lift * 0.7 + sweep * 0.4;
    }

    // Damage tint, set to 1 by whoever landed the hit and decayed here.
    // Slow: at this camera distance a quarter second flash is easy to miss.
    if (hurtRef) {
      flash(hurtRef.current);
      if (hurtRef.current > 0) hurtRef.current = Math.max(0, hurtRef.current - dt * 1.2);
    }

    if (joints) {
      const { armL, armR, legL, legR, spine } = joints;
      // one swing drives everything; arms lead the opposite leg, as they do
      const swing = Math.sin(stride.current);
      const amp = speed.current;

      legL.rotation.x = swing * 0.6 * amp;
      legR.rotation.x = -swing * 0.6 * amp;

      // arm bones run on ZYX order (see rigCharacter): X holds the palm twist,
      // Y is the forward/back swing, Z is the fold down to the body.
      //
      // Both arms take the SAME Y angle. They are mirrored in space (one bone
      // points +X, the other -X), so one shared angle already sends them in
      // opposite directions. Giving them opposite signs, as this did before,
      // cancels the mirror out and swings both arms forward together.
      if (tPose) {
        const rest = ARM_REST;
        const reach = -swing * 0.65 * amp;
        armL.rotation.x = ARM_TWIST;
        armR.rotation.x = ARM_TWIST;
        armL.rotation.y = reach;
        armR.rotation.y = reach;
        armL.rotation.z = -rest - Math.abs(swing) * 0.07 * amp;
        // the weapon arm overrides the walk: an attack lifts it clear of the body
        armR.rotation.z = rest + Math.abs(swing) * 0.07 * amp - lift * 1.5 - sweep * 0.45;
        armR.rotation.y = reach * (1 - lift - sweep * 0.5) - lift * 0.7 + sweep * 1.2;
        armL.rotation.y += sweep * 0.25;
      }

      spine.rotation.y = swing * 0.07 * amp - lift * 0.25 + sweep * 0.4;
      spine.rotation.x = Math.sin(t * 1.8) * 0.012 + sweep * 0.12;
    }

    const g = body.current;
    if (g) {
      g.position.y = Math.abs(Math.sin(stride.current)) * 0.045 * speed.current;
      g.rotation.x = speed.current * 0.06 - lift * 0.04 + sweep * 0.09;
      g.rotation.z = Math.sin(stride.current) * 0.02 * speed.current + Math.sin(t * 28) * (hurtRef?.current || 0) * 0.08;
    }
  });

  return (
    <group rotation={[0, MODEL_YAW, 0]}>
      <primitive ref={body} object={object} />
      {weapon && <mesh ref={slash} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.9, 0]} visible={false}>
        <ringGeometry args={[weapon.reach * 0.65, weapon.reach * 0.8, 24, 1, -Math.PI * 0.95, Math.PI * 0.9]} />
        <meshBasicMaterial color="#ffe6a1" side={THREE.DoubleSide} transparent opacity={0} depthWrite={false} />
      </mesh>}
      {weapon && joints && (
        <Suspense fallback={null}>
          <Weapon
            model={weapon.model}
            length={weapon.length}
            grip={weapon.grip}
            rot={weapon.rot}
            joints={joints}
            swingRef={attackRef}
            unit={1 / (object.children[0]?.scale?.x || 1)}
          />
        </Suspense>
      )}
    </group>
  );
}

/* ---------------- weapons ---------------- */

/**
 * The weapon packs are OBJ + MTL, so the material file has to be loaded first
 * and handed to OBJLoader. Fitted by longest axis and hung off the right arm
 * bone, which the auto rig already gives us as a hand socket.
 */
/**
 * `grip` says where the hand goes on the model, measured from the actual OBJ:
 *
 *   base   the handle is the low end (staffs)
 *   top    the handle is the HIGH end, so the model is authored point down.
 *          Spartan_sword and Falchion put their handle material at 0.79..0.97
 *          of the long axis, which is why they came out held by the blade.
 *   center a bow is gripped in the middle, not at either end.
 */
function useWeapon(model, length, grip) {
  const materials = useLoader(MTLLoader, `/models/weapons/${model}.mtl`);
  const obj = useLoader(OBJLoader, `/models/weapons/${model}.obj`, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return useMemo(() => {
    const copy = obj.clone(true);
    copy.position.set(0, 0, 0);

    // Packs author weapons along whichever axis suited the modeller. Turn the
    // longest axis to +Y first, so from here on "along the blade" is always Y.
    const raw = new THREE.Box3().setFromObject(copy);
    const size = raw.getSize(new THREE.Vector3());
    if (size.x >= size.y && size.x >= size.z) copy.rotation.z = Math.PI / 2;
    else if (size.z > size.y) copy.rotation.x = -Math.PI / 2;

    // Turn it end for end BEFORE anything is measured. Doing this after the
    // measurement, as it was, meant the offset was computed for the old
    // orientation and the weapon ended up floating in the wrong place.
    if (grip === "top") copy.rotation.x += Math.PI;

    copy.updateMatrixWorld(true);
    const aligned = new THREE.Box3().setFromObject(copy);
    copy.scale.setScalar(length / (aligned.getSize(new THREE.Vector3()).y || 1));

    // measure once more at final scale, then slide the grip onto the origin so
    // the pivot IS the hand
    copy.updateMatrixWorld(true);
    const fitted = new THREE.Box3().setFromObject(copy);
    const center = fitted.getCenter(new THREE.Vector3());
    const y = grip === "center" ? -center.y : -fitted.min.y;
    copy.position.set(-center.x, y, -center.z);

    copy.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });

    const holder = new THREE.Group();
    holder.add(copy);
    return holder;
  }, [obj, length, grip]);
}

/**
 * `unit` is how many bone space units make one world unit. Bones live in the
 * model's original geometry space, which these packs author in the hundreds,
 * so a weapon parented to a hand shrinks to nothing without this factor.
 */
/** How far down the arm the hand sits, in world metres for a 1.8 m character. */
const HAND_REACH = 0.6;

/** Collision only cares about geometry a walking player could hit. */
const WALK_HEIGHT = 1.8;

export function Weapon({ model, length = 0.9, grip = "base", rot, joints, swingRef, unit = 1 }) {
  const weapon = useWeapon(model, length, grip);
  const pivot = useRef();

  // parent to the arm bone once it exists, so the weapon inherits every swing
  useEffect(() => {
    const hand = joints?.armR;
    const node = pivot.current;
    if (!hand || !node) return;
    hand.add(node);
    return () => hand.remove(node);
  }, [joints, weapon]);

  useFrame(() => {
    const node = pivot.current;
    if (!node) return;
    // rest points the blade forward; the swing arcs it down and back up
    const { lift, sweep } = attackPose(swingRef?.current ?? 0);
    node.rotation.z = (rot?.[2] ?? 0) - lift * 0.5 + sweep * 1.4;
  });

  return (
    /**
     * The bone's origin is the SHOULDER and the arm runs down its local -X, so
     * the hand is out along -X, not below the pivot. Getting this wrong is what
     * left the weapon floating at the shoulder.
     */
    <group
      ref={pivot}
      scale={unit}
      position={[-HAND_REACH * unit, 0, 0]}
      rotation={[rot?.[0] ?? 0, rot?.[1] ?? 0, rot?.[2] ?? 0]}
    >
      <primitive object={weapon} />
    </group>
  );
}

/* ---------------- scattered scenery ---------------- */

/**
 * Both environment packs author every prop as ONE mesh with a few material
 * groups, which is exactly what InstancedMesh wants. The transform is baked
 * into a cloned geometry so each instance only carries a position, a spin and
 * a size, and a whole field of trees costs one draw call per material group.
 */
function usePlantParts(url, height) {
  const fbx = useFBX(url);

  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const scale = size.y > 0 ? height / size.y : 1;

    const parts = [];
    fbx.updateMatrixWorld(true);
    fbx.traverse((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return;
      const geo = o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      geo.scale(scale, scale, scale);
      geo.computeBoundingBox();
      geo.translate(0, -geo.boundingBox.min.y, 0); // sit on the ground
      parts.push({ geo, material: o.material });
    });
    return parts;
  }, [fbx, height]);
}

export function ModelField({ url, height, spots }) {
  const parts = usePlantParts(url, height);

  return (
    <group>
      {parts.map((part, i) => (
        <Instances
          key={i}
          frames={1}
          limit={spots.length}
          geometry={part.geo}
          material={part.material}
          castShadow
          receiveShadow
        >
          {spots.map((s, j) => (
            <Instance key={j} position={[s.x, 0, s.z]} rotation={[0, s.rot, 0]} scale={s.s} />
          ))}
        </Instances>
      ))}
    </group>
  );
}

/* ---------------- props ---------------- */

/**
 * `onFootprint` reports the model's real XZ half extents once it has loaded,
 * so collision can match the building instead of guessing from its height.
 * A tall thin tower and a low wide barn need very different blockers.
 */
export function Building({ url, height = 5, onFootprint }) {
  const fbx = useFBX(url);

  const { model, half } = useMemo(() => {
    const built = normalize(fbx.clone(true), height);
    built.updateMatrixWorld(true);

    /**
     * Measured HERE, while the model still has no parent, so the box is in the
     * building's own frame. Measuring it later from the mounted object returned
     * a world space box that already had the building's rotation baked in, and
     * the collision code then rotated it a second time.
     *
     * Only geometry below walking height counts. A windmill's sails reach 70%
     * further than its base, so the whole model's box would wall off open
     * ground the player can plainly see is empty.
     */
    const v = new THREE.Vector3();
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let counted = 0;

    built.traverse((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return;
      const pos = o.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (v.y > WALK_HEIGHT) continue;
        counted += 1;
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.z < minZ) minZ = v.z;
        if (v.z > maxZ) maxZ = v.z;
      }
    });

    if (!counted) {
      // nothing down here at all (a hanging sign?): fall back to the full box
      const size = new THREE.Box3().setFromObject(built).getSize(new THREE.Vector3());
      return { model: built, half: [(size.x / 2) * 0.9, (size.z / 2) * 0.9] };
    }

    // trim slightly: eaves still overhang, and blocking at them would stop the
    // player short of the wall
    return { model: built, half: [((maxX - minX) / 2) * 0.92, ((maxZ - minZ) / 2) * 0.92] };
  }, [fbx, height]);

  useEffect(() => {
    onFootprint?.(half[0], half[1]);
  }, [half, onFootprint]);

  return <primitive object={model} />;
}

/**
 * Animals are single static meshes too (0 clips, 0 skins), so they get the
 * same treatment: a rig for the legs plus real wandering, since standing
 * still and spinning in place was what made them look frozen.
 */
export function Animal({
  url,
  height = 0.9,
  home,
  radius = 4,
  speed = 1,
  hop = false,
  seed = 0,
}) {
  const { scene } = useGLTF(url);
  const { object, joints } = useMemo(
    // four legs, trotting on diagonal pairs rather than pacing left/right
    () => rigCharacter(scene, height, { arms: false, diagonal: true }),
    [scene, height]
  );
  const root = useRef();
  const target = useRef(null);
  const rest = useRef(seed * 0.7);
  const moving = useRef(false);

  const pick = () => {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    target.current = [home[0] + Math.cos(a) * r, home[2] + Math.sin(a) * r];
  };

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    dt = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime + seed;

    if (rest.current > 0) {
      rest.current -= dt;
      moving.current = false;
      g.position.y = THREE.MathUtils.damp(g.position.y, 0, 12, dt);
      g.rotation.x = Math.sin(t * 1.1) * 0.09; // grazing dip
    } else {
      if (!target.current) pick();
      const [tx, tz] = target.current;
      const dx = tx - g.position.x;
      const dz = tz - g.position.z;
      const d = Math.hypot(dx, dz);

      if (d < 0.2) {
        target.current = null;
        rest.current = 1.5 + Math.random() * 3;
        moving.current = false;
      } else {
        const step = Math.min(d, speed * dt);
        g.position.x += (dx / d) * step;
        g.position.z += (dz / d) * step;
        g.rotation.y += angleTo(g.rotation.y, Math.atan2(dx, dz)) * (1 - Math.exp(-8 * dt));
        moving.current = true;

        if (hop) {
          const bounce = Math.abs(Math.sin(t * 5.5));
          g.position.y = bounce * 0.38;
          g.rotation.x = -bounce * 0.3;
        } else {
          g.position.y = Math.abs(Math.sin(t * 8)) * 0.07;
          g.rotation.x = Math.sin(t * 16) * 0.03;
        }
      }
    }

    // the two bones carry diagonal pairs, so opposite angles produce a trot:
    // front right and rear left reach forward while the other pair pushes off
    if (joints) {
      const swing = moving.current ? Math.sin(t * (hop ? 5.5 : 9)) : 0;
      // a hop is the exception: rabbits push off with both pairs together
      joints.legL.rotation.x = swing * 0.5;
      joints.legR.rotation.x = (hop ? swing : -swing) * 0.5;
    }
  });

  return (
    // facing is mutated on the outer group, so the model offset lives inside it
    <group ref={root} position={home}>
      <group rotation={[0, MODEL_YAW, 0]}>
        <primitive object={object} />
      </group>
    </group>
  );
}
