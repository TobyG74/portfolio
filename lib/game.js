/**
 * Progression rules for the world: XP, levels, rank titles, weapon unlocks and
 * the monster table. Pure data and pure functions, no THREE and no React, so
 * scripts/check-game.mjs can assert the curve stays sane.
 *
 * World scale and pacing knobs live in lib/config.js; this file reads them
 * rather than keeping a second copy.
 */

// relative, not the @/ alias: the check scripts run this file under plain Node
import { world } from "./config.js";

export const MAX_LEVEL = 30;

/**
 * Playable classes, one per model in FreePack_RPGClasses. Cosmetic only: they
 * share the same stats, since the pack gives no reason to separate them and a
 * fake stat spread would just be a trap for the player.
 *
 * The key is `model`, not `id`, so scripts/check-assets.mjs picks these up
 * with the same scan it runs over every other model reference.
 */
export const CLASSES = [
  { model: "Warrior", name: "KSATRIA", face: "⚔️" },
  { model: "Paladin", name: "PALADIN", face: "🛡️" },
  { model: "Wizard", name: "PENYIHIR", face: "🔮" },
  { model: "Shaman", name: "DUKUN", face: "🌿" },
  { model: "Hunter", name: "PEMBURU", face: "🏹" },
  { model: "Assassin", name: "PEMBAYANG", face: "🗡️" },
];

export const DEFAULT_CLASS = CLASSES[0].model;

export const isClass = (model) => CLASSES.some((c) => c.model === model);

/** Cumulative XP needed to reach a level. Level 1 costs nothing. */
export function xpToReach(level) {
  if (level <= 1) return 0;
  return Math.round(45 * (level - 1) ** 1.65);
}

export function levelFor(xp) {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpToReach(level + 1)) level += 1;
  return level;
}

/** Progress through the current level, 0 to 1, for the HUD bar. */
export function levelProgress(xp) {
  const level = levelFor(xp);
  if (level >= MAX_LEVEL) return 1;
  const floor = xpToReach(level);
  const ceil = xpToReach(level + 1);
  return Math.min(1, Math.max(0, (xp - floor) / (ceil - floor || 1)));
}

/** Honorific ranks, matching how the villagers speak. */
const RANKS = [
  { from: 1, title: "PENDATANG" },
  { from: 3, title: "PENGEMBARA" },
  { from: 5, title: "PEMBURU" },
  { from: 8, title: "KSATRIA" },
  { from: 12, title: "PANGLIMA" },
  { from: 18, title: "LEGENDA" },
];

export function rankFor(level) {
  let title = RANKS[0].title;
  for (const r of RANKS) if (level >= r.from) title = r.title;
  return title;
}

/**
 * Weapons unlock by level and the best unlocked one is equipped automatically.
 *
 * `model`  file under /models/weapons (an .obj with a matching .mtl)
 * `length` world size along the blade, in metres
 * `grip`   where the hand sits on the model, read from the OBJ's own material
 *          groups rather than guessed:
 *            base   handle at the low end (both staffs)
 *            top    handle at the HIGH end, model authored point down. The
 *                   swords put their handle material at ~0.8 to 0.97 of the
 *                   long axis, so without this they are held by the blade.
 *            center gripped in the middle (a bow)
 * `rot`    per weapon Euler tweak at rest, radians. A bow is carried across
 *          the body rather than pointed forward, hence its quarter turn.
 */
export const WEAPONS = [
  { id: "spartan", name: "PEDANG SPARTA", model: "Spartan_sword", level: 1, price: 0, reach: 2.2, damage: 24, length: 0.85, grip: "top" },
  { id: "staff1", name: "TONGKAT PUSAKA", model: "Staff_01", level: 3, price: 140, reach: 2.6, damage: 31, length: 1.5, grip: "base" },
  { id: "bow", name: "BUSUR PEMBURU", model: "bow_01", level: 6, price: 420, reach: 3.2, damage: 39, length: 1.1, grip: "center", rot: [0, Math.PI / 2, 0] },
  { id: "falchion", name: "FALCHION", model: "Falchion_sword", level: 10, price: 1100, reach: 2.4, damage: 52, length: 0.95, grip: "top" },
  { id: "staff3", name: "TONGKAT AGUNG", model: "Staff_03", level: 15, price: 2600, reach: 2.8, damage: 68, length: 1.6, grip: "base" },
];

/** The free starting weapon, so a new player is never empty handed. */
export const STARTER = WEAPONS[0].id;

export const byId = (id) => WEAPONS.find((w) => w.id === id) || WEAPONS[0];

/** Equipped weapon: the hardest hitting one the player actually owns. */
export function weaponFor(owned) {
  const list = Array.isArray(owned) && owned.length ? owned : [STARTER];
  let best = WEAPONS[0];
  for (const id of list) {
    const w = byId(id);
    if (w.damage > best.damage) best = w;
  }
  return best;
}

/** Why a weapon cannot be bought yet, or null when it can. */
export function blockedReason(weapon, { level, gold, owned }) {
  if (owned.includes(weapon.id)) return "DIMILIKI";
  if (level < weapon.level) return `BUTUH LV${weapon.level}`;
  if (gold < weapon.price) return `BUTUH ${weapon.price} KOIN`;
  return null;
}

/**
 * Monster table. `h` is the height every model is normalized to, `hp` its
 * health, `xp` the reward, `speed` chase speed in metres per second.
 * Spawn rings keep them outside the village so the plaza stays peaceful.
 */
export const MONSTERS = [
  { id: "rat", model: "Rat", h: 0.55, hp: 40, xp: 12, speed: 3.4, damage: 6, ring: [17, 36] },
  { id: "bat", model: "Bat", h: 0.7, hp: 34, xp: 15, speed: 4.2, damage: 7, ring: [20, 48], fly: 1.6 },
  { id: "spider", model: "Spider", h: 0.9, hp: 70, xp: 26, speed: 3, damage: 11, ring: [26, 62] },
  { id: "wasp", model: "Wasp", h: 0.6, hp: 46, xp: 22, speed: 4.6, damage: 9, ring: [26, 62], fly: 2.1 },
  { id: "plant", model: "EaterPlant", h: 1.2, hp: 110, xp: 40, speed: 0, damage: 14, ring: [15, 62] },
];

export const SPAWN_COUNT = 24; // monsters alive at once
export const RESPAWN_MS = 9000;

/** Monsters refuse to cross this radius, so the village stays a safe haven. */
export const VILLAGE_RADIUS = world.villageRadius;

export function monsterSpawn(uid, gen, center = null, blocked = () => false) {
  const base = MONSTERS[(uid + gen * 3) % MONSTERS.length];
  const angle = uid === 0 && gen === 0 ? Math.PI / 2 - 0.24 : (uid * 2.399 + gen * 1.117) % (Math.PI * 2);
  const t = ((uid * 37 + gen * 61) % 100) / 100;
  const radius = center
    ? Math.max(12 + t * 12, VILLAGE_RADIUS + 1 - Math.hypot(...center))
    : base.ring[0] + t * (base.ring[1] - base.ring[0]);
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const a = angle + attempt * 2.399;
    const x = Math.max(-world.bound + 1, Math.min(world.bound - 1, (center?.[0] ?? 0) + Math.cos(a) * radius));
    const z = Math.max(-world.bound + 1, Math.min(world.bound - 1, (center?.[1] ?? 0) + Math.sin(a) * radius));
    const fromVillage = Math.hypot(x, z);
    if (fromVillage < VILLAGE_RADIUS || blocked(x, z, 0.4)) continue;
    if (center && Math.hypot(x - center[0], z - center[1]) < 10) continue;
    return { spec: scaleMonster(base, monsterLevelAt(fromVillage)), at: [x, z] };
  }
  return null;
}

/**
 * A monster's level comes from how far out it spawned: the plaza edge is
 * level 1 and the far treeline is dangerous. That gives the map difficulty
 * without any extra state to track.
 */
export function monsterLevelAt(radius) {
  return Math.max(1, Math.min(20, 1 + Math.floor((radius - VILLAGE_RADIUS) / 3.5)));
}

/** Scales a monster's stats to its level. Reward grows faster than threat. */
export function scaleMonster(spec, level) {
  const k = Math.max(0, level - 1);
  return {
    ...spec,
    level,
    hp: Math.round(spec.hp * (1 + 0.4 * k)),
    damage: Math.round(spec.damage * (1 + 0.26 * k)),
    xp: Math.round(spec.xp * (1 + 0.55 * k)),
    gold: Math.round((4 + spec.xp * 0.3) * (1 + 0.45 * k)),
  };
}

/** Damage the player deals, so a better weapon shortens the fight. */
export function playerDamage(level, owned) {
  return weaponFor(owned).damage + level * 2;
}

export const PLAYER_MAX_HP = 100;
