/**
 * Runs the auto rig against the real assets and asserts the skinning is sane.
 * Node has no DOM, so texture loading is stubbed out before parsing.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { angleTo, attackPose, rigCharacter } from "../lib/autorig.js";

for (const from of [-50 * Math.PI, -3, 0, 3, 50 * Math.PI]) {
  for (const to of [-Math.PI, -1, 0, 1, Math.PI]) {
    const turn = angleTo(from, to);
    assert.ok(Math.abs(turn) <= Math.PI, "turns must take the shortest route, even after many revolutions");
    assert.ok(Math.abs(Math.cos(from + turn) - Math.cos(to)) < 1e-10);
    assert.ok(Math.abs(Math.sin(from + turn) - Math.sin(to)) < 1e-10);
  }
}

assert.deepEqual(attackPose(0), { lift: 0, sweep: 0 });
assert.deepEqual(attackPose(1), { lift: 0, sweep: 0 });
assert.deepEqual(attackPose(0.32), { lift: 1, sweep: 0 });
assert.equal(attackPose(0.5).sweep, 1, "the weapon must reach its target when combat damage lands");
for (let i = 0; i <= 100; i++) {
  const pose = attackPose(i / 100);
  assert.ok(pose.lift >= 0 && pose.lift <= 1 && pose.sweep >= 0 && pose.sweep <= 1);
}
for (const boundary of [0.32, 0.5, 0.62, 1]) {
  const before = attackPose(boundary - 1e-6);
  const after = attackPose(boundary + 1e-6);
  assert.ok(Math.abs(before.lift - after.lift) < 1e-4 && Math.abs(before.sweep - after.sweep) < 1e-4, "attack phases must blend continuously");
}

// GLTFLoader reaches for `self.URL` when unpacking embedded images, and no
// loader can decode a PNG without a DOM. Rigging only needs the geometry.
globalThis.self ??= globalThis;
THREE.TextureLoader.prototype.load = function (url, onLoad) {
  const texture = new THREE.Texture();
  // must settle, or GLTFLoader waits forever on the texture dependency
  if (onLoad) onLoad(texture);
  return texture;
};

const ROOT = "public/models";

function checkRig(label, object, targetHeight, expectArms) {
  const diagonal = !expectArms; // four legged models trot on diagonal pairs
  const { object: rigged, joints, tPose, shoulderT } = rigCharacter(object, targetHeight, {
    arms: expectArms,
    diagonal,
  });
  assert.ok(joints, `${label}: no joints produced`);

  if (expectArms) {
    // every class in this pack is modelled T posed; if detection ever misses,
    // the arms fall back to rotating on their own axis and stop reading
    assert.ok(tPose, `${label}: T pose not detected, arms would not fold down`);
    assert.ok(
      shoulderT > 0.5 && shoulderT < 0.9,
      `${label}: shoulder measured at ${shoulderT}, outside the plausible band`
    );
    assert.ok(
      Math.abs(joints.armL.rotation.z) > 1,
      `${label}: arms were not folded out of the T pose`
    );
  }

  // count SOURCE meshes so a model split into parts (Paladin, Hunter) fails
  // loudly if any part is left unrigged
  let sourceMeshes = 0;
  object.traverse((o) => {
    if (o.isMesh) sourceMeshes++;
  });

  const skinned = [];
  rigged.traverse((o) => {
    if (o.isSkinnedMesh) skinned.push(o);
  });
  assert.equal(
    skinned.length,
    sourceMeshes,
    `${label}: rigged ${skinned.length} of ${sourceMeshes} meshes`
  );

  const hits = new Map();
  let verts = 0;
  for (const m of skinned) {
    const idx = m.geometry.attributes.skinIndex;
    const wgt = m.geometry.attributes.skinWeight;
    assert.ok(idx && wgt, `${label}: missing skin attributes`);
    verts += wgt.count;
    for (let i = 0; i < wgt.count; i++) {
      const w = [wgt.getX(i), wgt.getY(i), wgt.getZ(i), wgt.getW(i)];
      const sum = w.reduce((a, b) => a + b, 0);
      assert.ok(Number.isFinite(sum), `${label}: NaN weight at vertex ${i}`);
      assert.ok(Math.abs(sum - 1) < 1e-4, `${label}: weights sum to ${sum} at vertex ${i}`);
      if (w[0] > 0.5) hits.set(idx.getX(i), (hits.get(idx.getX(i)) || 0) + 1);
    }
  }
  assert.ok(
    skinned.every((m) => m.skeleton === skinned[0].skeleton),
    `${label}: parts are not sharing one skeleton`
  );

  // bone order is [pelvis, spine, armL, armR, legL, legR]
  const legs = (hits.get(4) || 0) + (hits.get(5) || 0);
  const arms = (hits.get(2) || 0) + (hits.get(3) || 0);
  assert.ok(legs > 20, `${label}: only ${legs} vertices bound to the legs`);
  if (expectArms) assert.ok(arms > 20, `${label}: only ${arms} vertices bound to the arms`);

  // a quadruped's two leg bones must each hold BOTH a front and a rear leg,
  // which is what makes the gait a trot instead of a pace
  if (diagonal) {
    const bounds = new THREE.Box3();
    for (const m of skinned) {
      m.geometry.computeBoundingBox();
      bounds.union(m.geometry.boundingBox);
    }
    const cx = (bounds.max.x + bounds.min.x) / 2;
    const cz = (bounds.max.z + bounds.min.z) / 2;
    const quadrant = { 4: new Set(), 5: new Set() };

    for (const m of skinned) {
      const p = m.geometry.attributes.position;
      const idx = m.geometry.attributes.skinIndex;
      const wgt = m.geometry.attributes.skinWeight;
      for (let i = 0; i < p.count; i++) {
        const bone = idx.getX(i);
        if (wgt.getX(i) < 0.5 || (bone !== 4 && bone !== 5)) continue;
        const side = p.getX(i) > cx ? "R" : "L";
        const fore = p.getZ(i) > cz ? "F" : "B";
        quadrant[bone].add(side + fore);
      }
    }

    for (const bone of [4, 5]) {
      const corners = [...quadrant[bone]];
      assert.ok(
        corners.some((c) => c[1] === "F") && corners.some((c) => c[1] === "B"),
        `${label}: leg bone ${bone} only holds ${corners.join(",")}, that is a pace not a trot`
      );
    }
    assert.ok(
      quadrant[4].has("RF") && quadrant[4].has("LB"),
      `${label}: bone 4 must pair front right with rear left, got ${[...quadrant[4]].join(",")}`
    );
  }

  const box = new THREE.Box3().setFromObject(rigged);
  const h = box.max.y - box.min.y;
  assert.ok(Math.abs(h - targetHeight) < 0.05, `${label}: height ${h} != ${targetHeight}`);
  assert.ok(Math.abs(box.min.y) < 0.05, `${label}: not standing on the ground (${box.min.y})`);

  console.log(
    `  ok ${label.padEnd(10)} parts=${skinned.length} verts=${String(verts).padStart(5)} legs=${String(legs).padStart(4)} arms=${String(arms).padStart(4)} shoulder=${shoulderT.toFixed(2)} tpose=${tPose ? "y" : "n"}`
  );
}

const fbx = new FBXLoader();
console.log("characters:");
for (const name of ["Wizard", "Warrior", "Hunter", "Shaman", "Paladin", "Assassin"]) {
  const buf = fs.readFileSync(`${ROOT}/chars/${name}.fbx`);
  const scene = fbx.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "");
  checkRig(name, scene, 1.8, true);
}

const gltf = new GLTFLoader();
console.log("animals:");
for (const name of ["Cow", "Dog", "Fox", "Cat", "Bunny"]) {
  const buf = fs.readFileSync(`${ROOT}/animals/${name}.glb`);
  const parsed = await new Promise((res, rej) =>
    gltf.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "", res, rej)
  );
  checkRig(name, parsed.scene, 1.0, false);
}

console.log("\nall rig checks passed");
