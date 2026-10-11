/**
 * Pins the building collision maths.
 *
 * A sign error here is invisible in review and only shows up in play as
 * "I can still walk into that house", which is easy to misread as a wrong
 * model size. It shipped twice before this file existed.
 */
import assert from "node:assert/strict";
import { makeBlockers, rotateY } from "../lib/collision.js";

const near = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;

/* ---- rotateY must match three's own convention ---- */

// a quarter turn about Y sends +X to -Z, not +Z. Getting this backwards is
// what rotated every blocker the wrong way.
{
  const [x, z] = rotateY(1, 0, Math.PI / 2);
  assert.ok(near(x, 0) && near(z, -1), `Ry(90) on +X gave ${x},${z}, expected 0,-1`);
}
{
  const [x, z] = rotateY(0, 1, Math.PI / 2);
  assert.ok(near(x, 1) && near(z, 0), `Ry(90) on +Z gave ${x},${z}, expected 1,0`);
}
// and it must undo itself
for (const a of [0.3, 1.1, -2.4, Math.PI]) {
  const [x1, z1] = rotateY(3, -5, a);
  const [x2, z2] = rotateY(x1, z1, -a);
  assert.ok(near(x2, 3, 1e-9) && near(z2, -5, 1e-9), `rotateY did not round trip at ${a}`);
}

/* ---- an axis aligned building ---- */

const flat = makeBlockers([{ id: "hall", x: 0, z: 0, rot: 0, hx: 4, hz: 2 }]);

assert.equal(flat.blocked(0, 0, 0), true, "the centre must be inside");
assert.equal(flat.blocked(3.9, 1.9, 0), true, "just inside a corner must be inside");
assert.equal(flat.blocked(4.1, 0, 0), false, "past the long wall must be outside");
assert.equal(flat.blocked(0, 2.1, 0), false, "past the short wall must be outside");
// the long side is 4 and the short side 2: a circle can never express that
assert.equal(flat.blocked(3.5, 0, 0), true, "a rectangle must block along its long axis");
assert.equal(flat.blocked(0, 3.5, 0), false, "and must NOT block where it is thin");

// resolve pushes out through the nearest wall and leaves the other axis alone
{
  const [x, z] = flat.resolve(0, 1, 0.5);
  assert.ok(near(x, 0), "pushing out of the short wall must not slide sideways");
  assert.ok(near(z, 2.5), `expected to land on z = 2.5, got ${z}`);
}
{
  const [x, z] = flat.resolve(3.5, 0, 0.5);
  assert.ok(near(x, 4.5) && near(z, 0), `expected x = 4.5, got ${x},${z}`);
}
// a point already outside must be untouched
{
  const [x, z] = flat.resolve(9, 9, 0.5);
  assert.ok(near(x, 9) && near(z, 9), "an outside point must pass through unchanged");
}

/* ---- a rotated building: the case that was broken ---- */

const HX = 4;
const HZ = 1;
const ROT = Math.PI / 2; // a quarter turn: the long side now runs along Z
const turned = makeBlockers([{ id: "barn", x: 0, z: 0, rot: ROT, hx: HX, hz: HZ }]);

assert.equal(turned.blocked(0, 3.5, 0), true, "after a quarter turn the long side runs along Z");
assert.equal(turned.blocked(3.5, 0, 0), false, "and the short side now faces X");
assert.equal(turned.blocked(0, 4.5, 0), false, "still finite along its new long axis");

// the same test at an awkward angle, checked against the shape's own frame
{
  const rot = 0.7;
  const b = makeBlockers([{ id: "shed", x: 12, z: -5, rot, hx: 3, hz: 1 }]);
  // a point 2.5 along the shape's local X is inside; the same distance along
  // local Z is outside. Only a correctly oriented box can tell them apart.
  const [ix, iz] = rotateY(2.5, 0, rot);
  const [ox, oz] = rotateY(0, 2.5, rot);
  assert.equal(b.blocked(12 + ix, -5 + iz, 0), true, "inside along local X must block");
  assert.equal(b.blocked(12 + ox, -5 + oz, 0), false, "outside along local Z must not block");
}

/* ---- resolve always ends up outside, from anywhere ---- */

/**
 * Spaced so no two overlap, which is the contract: a village lays buildings
 * side by side, not on top of each other. Overlapping blockers can leave a
 * pocket with no legal position at all, and no amount of pushing fixes a
 * space that does not exist.
 */
const village = makeBlockers([
  { id: "a", x: 0, z: 0, rot: 0.4, hx: 3, hz: 1.5 },
  { id: "b", x: 12, z: 2, rot: -1.2, hx: 2, hz: 2 },
  { id: "c", x: -12, z: 6, rot: 2.9, hx: 4, hz: 1 },
  { id: "d", x: 2, z: 14, rot: 0.9, hx: 2.5, hz: 2.5 },
]);

for (let i = 0; i < 600; i++) {
  const x = ((i * 37) % 400) / 10 - 20;
  const z = ((i * 53) % 400) / 10 - 20;
  const [rx, rz] = village.resolve(x, z, 0.5);
  assert.equal(
    village.blocked(rx, rz, 0.5 - 1e-6),
    false,
    `resolve left a point inside a building: ${x},${z} -> ${rx},${rz}`
  );
}

// and a single pass is genuinely not enough: a point wedged between two close
// neighbours needs the repeat, which is why resolve loops
{
  const tight = makeBlockers([
    { id: "l", x: -2.2, z: 0, rot: 0, hx: 2, hz: 4 },
    { id: "r", x: 2.2, z: 0, rot: 0, hx: 2, hz: 4 },
  ]);
  const [x, z] = tight.resolve(0, 0, 0.1);
  assert.equal(tight.blocked(x, z, 0.1 - 1e-6), false, "a point between two buildings must escape both");
}

/* ---- set() replaces the placeholder footprint ---- */

const live = makeBlockers([{ id: "church", x: 0, z: 0, rot: 0, hx: 1, hz: 1 }]);
assert.equal(live.blocked(2, 0, 0), false, "the guess starts small");
live.set("church", 3, 2);
assert.equal(live.blocked(2, 0, 0), true, "the measured footprint must take effect");
live.set("does-not-exist", 99, 99); // must not throw
assert.equal(live.list.length, 1);

console.log("rotateY  : matches three's Ry convention");
console.log("rectangle: long and short sides distinguished, rotation respected");
console.log("resolve  : 600 sample points all ended up outside, wedged points escape");
console.log("\nall collision checks passed");
