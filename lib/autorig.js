import * as THREE from "three";

/**
 * Runtime auto rigging for static meshes.
 *
 * FreePack_RPGClasses ships merged meshes per class with no skeleton and no
 * animation clips, and the Animals_Pack GLBs report 0 clips and 0 skins, so
 * neither pack has anything to rotate. This module builds a skeleton at load
 * time instead: six bones, with skin weights painted by body region straight
 * from the bounding box. Kept free of React so scripts/check-rig.mjs can
 * exercise it against the real files.
 */

/** shortest signed angle from a to b, so turning never takes the long way */
export const angleTo = (a, b) => THREE.MathUtils.euclideanModulo(b - a + Math.PI, Math.PI * 2) - Math.PI;

/**
 * Yaw applied to every model so its front matches the engine's convention
 * (+Z is the walking direction). If they walk backwards, flip to Math.PI.
 */
export const MODEL_YAW = 0;

/**
 * Tuning knobs, as fractions of the model's height/width. If a class bends in
 * the wrong place (robed classes are the fussy ones) these are the numbers to
 * move, no asset work needed.
 */
const RIG = {
  hip: 0.48, // legs start below this height
  shoulder: 0.72, // fallback only; the real one is measured per model
  armInner: 0.16, // |x| / width past which a vertex counts as arm, not torso
  armBand: 0.16, // arm region reaches this far above and below the shoulder
  blend: 0.07, // softness of every transition, keeps joints from tearing
  legSpread: 0.09,
  /**
   * These packs are modelled in a T pose: the widest band of every class sits
   * at 0.50 of the model width, and width/height is ~0.85 to 1.02. So the arms
   * point along X, and the shoulder must first fold them down before any swing
   * is visible. Rotating a sideways arm around X only spins it on its own
   * axis, which is invisible on a limb this round. Radians from horizontal.
   */
  armRest: 1.28,
  /**
   * T posed arms are modelled palms forward. Twisting a quarter turn about the
   * arm's own axis puts the palm face down, and the rest fold then carries it
   * round to face the thigh, which is where a relaxed hand actually sits.
   * Flip the sign if the palms end up facing outward.
   */
  armTwist: Math.PI / 2,
};

/** Rest fold and palm twist for T posed arms, in radians. */
export const ARM_REST = RIG.armRest;
export const ARM_TWIST = RIG.armTwist;

export function attackPose(progress) {
  if (progress <= 0 || progress >= 1) return { lift: 0, sweep: 0 };
  const ease = (a, b) => THREE.MathUtils.smoothstep(progress, a, b);
  const lift = progress < 0.32 ? ease(0, 0.32) : 1 - ease(0.32, 0.62);
  const sweep = progress < 0.5 ? ease(0.32, 0.5) : 1 - ease(0.5, 1);
  return { lift, sweep };
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6)));
  return t * t * (3 - 2 * t);
};

/**
 * Every pack exports at a different unit scale and origin, so instead of hand
 * tuning magic numbers per file we measure the model and fit it to a known
 * height, centred on X/Z and standing on the ground.
 */
export function normalize(root, targetHeight) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.y > 0) root.scale.setScalar(targetHeight / size.y);

  const fitted = new THREE.Box3().setFromObject(root);
  const center = fitted.getCenter(new THREE.Vector3());
  root.position.set(-center.x, -fitted.min.y, -center.z);

  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  const wrapper = new THREE.Group();
  wrapper.add(root);
  return wrapper;
}

/**
 * Finds the shoulder by silhouette instead of trusting a constant: in a T pose
 * the widest slice of the body IS the outstretched arms. Classes disagree
 * (Wizard peaks around 0.55 of its height, Warrior around 0.70), so measuring
 * beats one shared magic number.
 */
function measureShoulder(parts, bb) {
  const BANDS = 20;
  const h = Math.max(1e-6, bb.max.y - bb.min.y);
  const w = Math.max(1e-6, bb.max.x - bb.min.x);
  const cx = (bb.max.x + bb.min.x) / 2;
  const widest = new Float32Array(BANDS);

  for (const { geo } of parts) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const ty = (p.getY(i) - bb.min.y) / h;
      if (ty < RIG.hip) continue; // legs are wide at the feet, ignore them
      const band = Math.min(BANDS - 1, Math.max(0, Math.floor(ty * BANDS)));
      const lat = Math.abs(p.getX(i) - cx) / w;
      if (lat > widest[band]) widest[band] = lat;
    }
  }

  let best = -1;
  let bestLat = 0;
  for (let i = 0; i < BANDS; i++) {
    if (widest[i] > bestLat) {
      bestLat = widest[i];
      best = i;
    }
  }
  // a real T pose reaches near half the width; if nothing does, the model is
  // not T posed and the constant is the safer answer
  if (best < 0 || bestLat < 0.3) return { shoulderT: RIG.shoulder, tPose: false };
  return { shoulderT: (best + 0.5) / BANDS, tPose: true };
}

const HURT_COLOR = new THREE.Color(1, 0.05, 0.05);

/**
 * Clones every material under a model and returns a setter that tints them
 * toward red. The clone matters: loaders hand the same material instance to
 * every copy of a model, so tinting a shared one would flash the whole village
 * red at once.
 */
export function makeFlasher(root) {
  const targets = [];

  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    const cloned = list.map((m) => {
      const copy = m.clone();
      if (copy.emissive) targets.push({ mat: copy, base: copy.emissive.clone() });
      return copy;
    });
    o.material = Array.isArray(o.material) ? cloned : cloned[0];
  });

  return (amount) => {
    for (const t of targets) t.mat.emissive.copy(t.base).lerp(HURT_COLOR, amount);
  };
}

/** Six bones laid out from the model's bounding box. Order defines skinIndex. */
function buildSkeleton(bb, shoulderT) {
  const h = Math.max(1e-6, bb.max.y - bb.min.y);
  const w = Math.max(1e-6, bb.max.x - bb.min.x);
  const cx = (bb.max.x + bb.min.x) / 2;
  const hipY = bb.min.y + h * RIG.hip;
  const shoulderY = bb.min.y + h * shoulderT;

  const pelvis = new THREE.Bone();
  pelvis.position.set(cx, hipY, 0);

  const spine = new THREE.Bone();
  pelvis.add(spine);

  const armL = new THREE.Bone();
  armL.position.set(w * RIG.armInner * 1.15, shoulderY - hipY, 0);
  spine.add(armL);

  const armR = new THREE.Bone();
  armR.position.set(-w * RIG.armInner * 1.15, shoulderY - hipY, 0);
  spine.add(armR);

  const legL = new THREE.Bone();
  legL.position.set(w * RIG.legSpread, 0, 0);
  pelvis.add(legL);

  const legR = new THREE.Bone();
  legR.position.set(-w * RIG.legSpread, 0, 0);
  pelvis.add(legR);

  return {
    bones: [pelvis, spine, armL, armR, legL, legR],
    joints: { pelvis, spine, armL, armR, legL, legR },
  };
}

const SPINE = 1;

/** Paints skinIndex/skinWeight onto a geometry using the whole model's box. */
function paintWeights(geo, bb, arms, shoulderT, diagonal) {
  const h = Math.max(1e-6, bb.max.y - bb.min.y);
  const w = Math.max(1e-6, bb.max.x - bb.min.x);
  const cx = (bb.max.x + bb.min.x) / 2;
  const cz = (bb.max.z + bb.min.z) / 2;

  const pos = geo.attributes.position;
  const skinIndex = new Uint16Array(pos.count * 4);
  const skinWeight = new Float32Array(pos.count * 4);

  for (let i = 0; i < pos.count; i++) {
    const side = pos.getX(i) - cx;
    const ty = (pos.getY(i) - bb.min.y) / h;

    // an arm vertex sits outside the torso silhouette AND inside the arm's
    // vertical window; both edges are soft so the shoulder does not tear.
    // Quadrupeds skip this: their "arm band" is just barrel, and rotating it
    // would fold the body instead of a limb.
    const lateral = smoothstep(RIG.armInner, RIG.armInner + RIG.blend, Math.abs(side) / w);
    const bottom = shoulderT - RIG.armBand;
    const top = shoulderT + RIG.armBand;
    const vertical =
      smoothstep(bottom - RIG.blend, bottom + RIG.blend, ty) *
      (1 - smoothstep(top - RIG.blend, top + RIG.blend, ty));
    const armness = arms ? lateral * vertical : 0;

    const legness =
      (1 - smoothstep(RIG.hip - RIG.blend * 2, RIG.hip + RIG.blend * 2, ty)) * (1 - armness);

    let bone = SPINE;
    let weight = 0;
    if (armness > legness && armness > 0.01) {
      bone = side > 0 ? 2 : 3;
      weight = armness;
    } else if (legness > 0.01) {
      /**
       * Two legged models split left/right. Four legged ones must split
       * DIAGONALLY, because that is how animals actually trot: front right
       * swings with rear left, then front left with rear right. Splitting a
       * quadruped left/right gives a pace, the odd rocking walk of a camel.
       *
       * Front and same side share a sign, so "same sign" IS one diagonal pair
       * and "opposite sign" is the other. Two bones cover all four legs.
       */
      if (diagonal) {
        const fore = pos.getZ(i) - cz;
        bone = side > 0 === fore > 0 ? 4 : 5;
      } else {
        bone = side > 0 ? 4 : 5;
      }
      weight = legness;
    }

    // the remainder always goes to the spine, so nothing is left unweighted
    skinIndex[i * 4] = bone;
    skinIndex[i * 4 + 1] = SPINE;
    skinWeight[i * 4] = weight;
    skinWeight[i * 4 + 1] = 1 - weight;
  }

  geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndex, 4));
  geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeight, 4));
}

/**
 * Rigs EVERY mesh in the model onto one shared skeleton. Some classes are
 * split into parts (Paladin is cloak + helmet + body, Hunter is body + hat),
 * and rigging only the first one left most of the character frozen.
 */
export function rigCharacter(source, targetHeight, { arms = true, diagonal = false } = {}) {
  const src = source.clone(true);
  src.updateMatrixWorld(true);

  // bake each part's transform into its geometry so every vertex lives in one
  // common space, which is what lets a single skeleton drive all of them
  const parts = [];
  src.traverse((o) => {
    if (o.isMesh && o.geometry?.attributes?.position) {
      const geo = o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      geo.computeBoundingBox();
      parts.push({ geo, material: o.material });
    }
  });

  if (!parts.length) return { object: normalize(src, targetHeight), joints: null };

  const bb = new THREE.Box3();
  for (const p of parts) bb.union(p.geo.boundingBox);

  const { shoulderT, tPose } = arms
    ? measureShoulder(parts, bb)
    : { shoulderT: RIG.shoulder, tPose: false };

  const container = new THREE.Group();
  const { bones, joints } = buildSkeleton(bb, shoulderT);
  container.add(joints.pelvis);

  // The skeleton must be built while the bones still match the geometry, since
  // Skeleton captures the bind pose from the bones' current world matrices.
  // Posing before this point would bake the pose in and deform nothing.
  container.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);

  for (const { geo, material } of parts) {
    paintWeights(geo, bb, arms, shoulderT, diagonal);
    const mesh = new THREE.SkinnedMesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    container.add(mesh);
    mesh.bind(skeleton);
  }

  // Now that the bind pose is captured, pose the arms out of the T.
  //
  // Euler order matters more than the angles here. The default XYZ applies Z
  // to the vector first, which would fold the arm before the twist and leave
  // the palm pointing wherever the fold put it. ZYX applies X first (twist
  // about the arm's own axis), then Y (the forward/back swing, animated per
  // frame), then Z (the fold down). That ordering is what makes both the palm
  // direction and the swing behave.
  if (tPose) {
    for (const [bone, sign] of [
      [joints.armL, -1],
      [joints.armR, 1],
    ]) {
      bone.rotation.order = "ZYX";
      bone.rotation.x = RIG.armTwist;
      bone.rotation.z = sign * RIG.armRest;
    }
  }

  return { object: normalize(container, targetHeight), joints, tPose, shoulderT };
}
