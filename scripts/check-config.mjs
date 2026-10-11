/**
 * The quality tiers decide whether a phone runs the world at all, and the
 * detection reads browser hints that are easy to get subtly wrong. This fakes
 * a handful of devices and pins which tier each one lands in.
 */
import assert from "node:assert/strict";
import { QUALITY, play, resolveQuality, scaled, site, world } from "../lib/config.js";

/** Minimal window stand-in, only the fields resolveQuality actually reads. */
const device = ({ coarse = false, cores = 8, ram, w = 1600, h = 900, search = "" }) => ({
  location: { search },
  innerWidth: w,
  innerHeight: h,
  matchMedia: (q) => ({ matches: q.includes("coarse") ? coarse : false }),
  navigator: { hardwareConcurrency: cores, ...(ram === undefined ? {} : { deviceMemory: ram }) },
});

const tier = (opts) => resolveQuality(device(opts)).id;

// desktops keep the full world
assert.equal(tier({ cores: 16 }), "high", "a 16 core desktop must get high");
assert.equal(tier({ cores: 8 }), "high");

// a weak desktop steps down rather than stuttering
assert.equal(tier({ cores: 2 }), "medium", "a dual core desktop must not run high");

// phones: the case that was lagging
assert.equal(tier({ coarse: true, cores: 4, ram: 4, w: 390, h: 844 }), "low", "a mid phone must get low");
assert.equal(tier({ coarse: true, cores: 8, ram: 3, w: 412, h: 915 }), "low", "3 GiB must force low");
assert.equal(tier({ coarse: true, cores: 4, w: 1024, h: 768 }), "low", "4 cores on touch is low");
assert.equal(
  tier({ coarse: true, cores: 8, ram: 8, w: 1024, h: 1366 }),
  "medium",
  "a strong tablet lands in medium, not high"
);

// Safari reports no deviceMemory at all; that must not read as 0 GiB
assert.equal(tier({ coarse: true, cores: 6, w: 834, h: 1194 }), "medium", "missing ram must not crash or floor");

// the manual override is what makes this testable on a desktop
assert.equal(tier({ cores: 16, search: "?quality=low" }), "low");
assert.equal(tier({ coarse: true, cores: 2, search: "?quality=high" }), "high");
assert.equal(tier({ cores: 16, search: "?quality=nonsense" }), "high", "a bad value must be ignored");

// server side rendering has no window
assert.equal(resolveQuality(null).id, "high", "no window must not throw");

// every tier must be complete, or a missing field renders as undefined
for (const [name, q] of Object.entries(QUALITY)) {
  for (const key of ["dpr", "shadows", "shadowMap", "shadowExtent", "scenery", "monsters", "lights", "particles", "fog"]) {
    assert.ok(q[key] !== undefined, `tier ${name} is missing ${key}`);
  }
  assert.equal(q.dpr.length, 2, `tier ${name} dpr must be [min, max]`);
  assert.ok(q.dpr[1] >= q.dpr[0], `tier ${name} dpr is inverted`);
  assert.equal(q.fog.length, 2, `tier ${name} fog must be [near, far]`);
  assert.ok(q.fog[1] > q.fog[0], `tier ${name} fog is inverted`);
  assert.ok(q.monsters >= 1, `tier ${name} must spawn at least one monster`);
  assert.ok(q.lights >= 1 && q.lights <= 8, `tier ${name} must limit active street lights`);
  assert.ok(q.scenery > 0 && q.scenery <= 1, `tier ${name} scenery must be a 0..1 factor`);
}

// tiers must actually get lighter as they go down, or the fix does nothing
const order = [QUALITY.high, QUALITY.medium, QUALITY.low];
for (let i = 1; i < order.length; i++) {
  const hi = order[i - 1];
  const lo = order[i];
  assert.ok(lo.dpr[1] <= hi.dpr[1], "a lower tier must not render more pixels");
  assert.ok(lo.scenery < hi.scenery, "a lower tier must thin the scenery");
  assert.ok(lo.monsters < hi.monsters, "a lower tier must spawn fewer monsters");
  assert.ok(lo.lights < hi.lights, "a lower tier must use fewer active street lights");
  assert.ok(lo.shadowMap <= hi.shadowMap, "a lower tier must not enlarge the shadow map");
  assert.ok(lo.fog[1] <= hi.fog[1], "a lower tier must not draw further");
}
assert.equal(QUALITY.low.shadows, false, "the low tier must drop shadows, the biggest single cost");

// scaling never rounds a count away to nothing
assert.equal(scaled(520, 1), 520);
assert.equal(scaled(520, 0.28), 146);
assert.equal(scaled(1, 0.01), 1, "a count must never scale to zero");
assert.equal(scaled(3, 0.1), 1);

// the world stays self consistent
assert.ok(world.ground > world.bound * 2, "the ground must cover the walkable area");
assert.ok(world.plaza < world.villageRadius, "the plaza disc must sit inside the safe radius");
assert.ok(world.fog[1] > world.bound, "fog must reach past the play area");
assert.ok(play.playerSpeed > play.npcSpeed, "the player must outpace the villagers");
assert.equal(site.birthday.month, 7);
assert.equal(site.birthday.day, 30);

console.log("tiers    :", Object.keys(QUALITY).join(" "));
console.log(
  "phone    :",
  `low = dpr ${QUALITY.low.dpr[1]}, shadows off, ${Math.round(QUALITY.low.scenery * 100)}% scenery, ${QUALITY.low.monsters} monsters`
);
console.log(
  "desktop  :",
  `high = dpr ${QUALITY.high.dpr[1]}, ${QUALITY.high.shadowMap}px shadows, ${QUALITY.high.monsters} monsters`
);
console.log("world    :", `${world.bound * 2}m across, village haven ${world.villageRadius}m`);
console.log("\nall config checks passed");
