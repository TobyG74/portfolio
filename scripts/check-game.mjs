/**
 * Asserts the progression rules hold: the XP curve only ever climbs, levels
 * and weapons unlock in order, and the rank titles cover every level.
 */
import assert from "node:assert/strict";
import { world } from "../lib/config.js";
import {
  MAX_LEVEL,
  MONSTERS,
  STARTER,
  VILLAGE_RADIUS,
  WEAPONS,
  blockedReason,
  levelFor,
  levelProgress,
  monsterLevelAt,
  monsterSpawn,
  playerDamage,
  rankFor,
  scaleMonster,
  weaponFor,
  xpToReach,
} from "../lib/game.js";

// the curve must be strictly increasing, or levelFor would stall
for (let l = 2; l <= MAX_LEVEL; l++) {
  assert.ok(
    xpToReach(l) > xpToReach(l - 1),
    `level ${l} costs ${xpToReach(l)}, not more than ${xpToReach(l - 1)}`
  );
}

// every threshold must land exactly on its level, and one XP short must not
for (let l = 1; l <= MAX_LEVEL; l++) {
  assert.equal(levelFor(xpToReach(l)), l, `xpToReach(${l}) does not read back as level ${l}`);
  if (l > 1) assert.equal(levelFor(xpToReach(l) - 1), l - 1, `level ${l} starts one XP too early`);
}

assert.equal(levelFor(0), 1);
assert.equal(levelFor(-50), 1, "negative XP must not drop below level 1");
assert.equal(levelFor(1e9), MAX_LEVEL, "level must cap");

for (const xp of [0, 1, 50, 999, 12345, 1e6]) {
  const p = levelProgress(xp);
  assert.ok(p >= 0 && p <= 1, `progress ${p} out of range at ${xp} xp`);
}

// weapons: ordered unlocks, always something equipped, damage never regresses
assert.equal(WEAPONS[0].level, 1, "level 1 must have a weapon to hold");
for (let i = 1; i < WEAPONS.length; i++) {
  assert.ok(WEAPONS[i].level > WEAPONS[i - 1].level, "weapon unlocks must be ordered");
  assert.ok(WEAPONS[i].damage > WEAPONS[i - 1].damage, "later weapons must hit harder");
}
const GRIPS = ["base", "top", "center"];
for (const w of WEAPONS) {
  // a missing length renders a zero sized weapon, which looks like no weapon
  assert.ok(w.length > 0.2 && w.length < 3, `${w.id} has an implausible length: ${w.length}`);
  assert.ok(w.reach > 0, `${w.id} cannot reach anything`);
  assert.ok(!w.rot || w.rot.length === 3, `${w.id} rot must be a 3 part euler`);
  // a wrong grip is the difference between wielding a sword and holding its
  // blade, and the value is read off the OBJ's own material groups
  assert.ok(GRIPS.includes(w.grip), `${w.id} has an unknown grip: ${w.grip}`);
}
assert.equal(WEAPONS.find((w) => w.id === "spartan").grip, "top", "the spartan handle is at the top of its model");
assert.equal(WEAPONS.find((w) => w.id === "falchion").grip, "top", "the falchion handle is at the top of its model");
assert.equal(WEAPONS.find((w) => w.id === "bow").grip, "center", "a bow is held in the middle");
// equipping depends on what is OWNED, never on level alone
assert.equal(weaponFor([]).id, STARTER, "an empty inventory must still hold the starter");
assert.equal(weaponFor(undefined).id, STARTER, "a missing inventory must not crash");
assert.equal(weaponFor(["bogus"]).id, STARTER, "an unknown id must fall back to the starter");
assert.equal(
  weaponFor([STARTER, "staff3", "bow"]).id,
  "staff3",
  "the hardest hitting owned weapon must be equipped"
);
assert.equal(WEAPONS[0].price, 0, "the starter must be free, it is never bought");

for (let l = 1; l <= MAX_LEVEL; l++) {
  assert.ok(playerDamage(l, [STARTER]) > 0);
  assert.ok(rankFor(l).length > 0, `no rank title at level ${l}`);
}

// the shop gate: every refusal must name a reason, and a met condition must
// clear it. Both gates matter, since gold alone should not skip the level.
const staff3 = WEAPONS.find((w) => w.id === "staff3");
assert.equal(blockedReason(staff3, { level: 1, gold: 99999, owned: [] }), "BUTUH LV15");
assert.ok(blockedReason(staff3, { level: 30, gold: 0, owned: [] })?.includes("KOIN"));
assert.equal(blockedReason(staff3, { level: 30, gold: 99999, owned: [] }), null);
assert.equal(blockedReason(staff3, { level: 30, gold: 99999, owned: ["staff3"] }), "DIMILIKI");

// monsters must be killable and worth killing
for (const m of MONSTERS) {
  assert.ok(m.hp > 0 && m.xp > 0 && m.damage > 0, `${m.id} has a nonsense stat`);
  assert.ok(m.ring[1] > m.ring[0], `${m.id} spawn ring is inside out`);
  assert.ok(m.ring[0] >= VILLAGE_RADIUS, `${m.id} spawns inside the safe village`);
  const hits = Math.ceil(m.hp / playerDamage(1, [STARTER]));
  assert.ok(hits <= 12, `${m.id} takes ${hits} hits at level 1, that is a chore`);
}

for (let gen = 0; gen < 5; gen++) {
  for (let uid = 0; uid < 24; uid++) {
    const spawn = monsterSpawn(uid, gen);
    assert.deepEqual(spawn, monsterSpawn(uid, gen), "spawns must stay stable across HUD updates");
    const radius = Math.hypot(...spawn.at);
    assert.ok(radius >= VILLAGE_RADIUS, "a monster must spawn outside the safe village");
    assert.ok(radius >= spawn.spec.ring[0] - 1e-9 && radius <= spawn.spec.ring[1] + 1e-9, "spawn must stay in its species ring");
    assert.equal(spawn.spec.level, monsterLevelAt(radius));
    assert.ok(spawn.spec.hp > 0 && spawn.spec.gold > 0);
  }
}
const firstSpawn = monsterSpawn(0, 0);
assert.ok(firstSpawn.at[1] > 15 && Math.abs(firstSpawn.at[0]) < 5, "the first rat must be visible beyond the southern gate");
assert.notDeepEqual(monsterSpawn(0, 0), monsterSpawn(0, 1), "respawn must reroll the monster");

for (const center of [[0, 8], [0, 0], [55, 55], [-72, 72], [72, -72], [-72, -72], [72, 72]]) {
  for (let uid = 0; uid < 24; uid += 1) {
    const spawn = monsterSpawn(uid, 3, center);
    assert.ok(spawn, `no spawn near ${center}`);
    assert.ok(Math.hypot(...spawn.at) >= VILLAGE_RADIUS, "refills must respect the safe village");
    assert.ok(spawn.at.every((v) => Math.abs(v) < world.bound), "refills must stay inside map bounds");
    const distance = Math.hypot(spawn.at[0] - center[0], spawn.at[1] - center[1]);
    assert.ok(distance >= 10 && distance <= 24.01, "refills must populate the player's surroundings without landing on them");
    assert.equal(spawn.spec.level, monsterLevelAt(Math.hypot(...spawn.at)));
  }
}
const firstCandidate = monsterSpawn(0, 1, [50, 50]);
const blockedCandidate = (x, z) => Math.hypot(x - firstCandidate.at[0], z - firstCandidate.at[1]) < 2;
assert.ok(!blockedCandidate(...monsterSpawn(0, 1, [50, 50], blockedCandidate).at), "blocked spawn must find another position");
assert.equal(monsterSpawn(0, 1, [50, 50], () => true), null, "an obstructed area must wait rather than spawn inside a wall");

// monster level rises with distance and never dips below 1
assert.equal(monsterLevelAt(0), 1, "nothing may be tougher than level 1 inside the village");
assert.equal(monsterLevelAt(VILLAGE_RADIUS), 1);
for (let r = VILLAGE_RADIUS; r < 60; r += 2) {
  assert.ok(monsterLevelAt(r + 2) >= monsterLevelAt(r), "difficulty must not fall off with distance");
}
assert.ok(monsterLevelAt(42) > monsterLevelAt(18), "the far ring must be harder than the near one");

// scaling: threat and reward both climb, and a level 1 scale is a no op
for (const m of MONSTERS) {
  assert.deepEqual(scaleMonster(m, 1).hp, m.hp, `${m.id} level 1 must be unscaled`);
  const weak = scaleMonster(m, 1);
  const strong = scaleMonster(m, 10);
  assert.ok(strong.hp > weak.hp && strong.damage > weak.damage, `${m.id} must scale up`);
  assert.ok(strong.xp > weak.xp && strong.gold > weak.gold, `${m.id} must pay more when harder`);
  assert.ok(weak.gold > 0, `${m.id} must drop coins at level 1`);
}

// a rough pacing sanity check: clearing the easiest monster should still
// reach level 5 in a session, not a week
const rat = MONSTERS.find((m) => m.id === "rat");
const killsToFive = Math.ceil(xpToReach(5) / scaleMonster(rat, 1).xp);
assert.ok(killsToFive <= 40, `level 5 needs ${killsToFive} rats, too grindy`);

// and the first purchase must be reachable, not a distant dream
const staff1 = WEAPONS.find((w) => w.id === "staff1");
const ratsToFirstBuy = Math.ceil(staff1.price / scaleMonster(rat, 2).gold);
assert.ok(ratsToFirstBuy <= 30, `the first weapon needs ${ratsToFirstBuy} rats, too expensive`);

console.log("levels   :", [1, 2, 3, 5, 10, 20, 30].map((l) => `L${l}=${xpToReach(l)}xp`).join(" "));
console.log("ranks    :", [1, 3, 5, 8, 12, 18].map((l) => `L${l}:${rankFor(l)}`).join(" "));
console.log("weapons  :", WEAPONS.map((w) => `L${w.level}:${w.id}@${w.price}`).join(" "));
console.log(
  "monsters :",
  [15, 22, 30, 42].map((r) => `r${r}=Lv${monsterLevelAt(r)}`).join(" ")
);
console.log(
  "rat      :",
  [1, 5, 10].map((l) => {
    const s = scaleMonster(MONSTERS[0], l);
    return `Lv${l}:${s.hp}hp/${s.damage}dmg/${s.xp}xp/${s.gold}koin`;
  }).join(" ")
);
console.log("pacing   :", `${killsToFive} rats to level 5, ${ratsToFirstBuy} to the first purchase`);
console.log("\nall game checks passed");
