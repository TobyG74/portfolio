/**
 * Single place to tune the site and the world.
 *
 * Everything here is data. No THREE, no React, no side effects, so it can be
 * imported from components, from route handlers and from the check scripts
 * alike. If you find yourself hunting through components for a number, it
 * probably belongs in this file.
 */

/* ---------------- dates and events ---------------- */

export const site = {
  /** The portfolio owner's birthday. Written 1 based, as people say it. */
  birthday: { month: 7, day: 30 },
  /** Set a year to show an age on the banner, or leave null to keep it quiet. */
  birthYear: null,
};

/* ---------------- world size ---------------- */

export const world = {
  /** Half the walkable square, in metres. The ground plane follows from it. */
  bound: 72,
  /** Ground plane side length. Keep it comfortably above bound * 2. */
  ground: 230,
  /**
   * The lighter disc of grass that marks the village centre. Kept smaller than
   * villageRadius so monsters visibly stop OUTSIDE the plaza, rather than
   * standing on its edge and making the safe zone look like a lie.
   */
  plaza: 13,
  /** Monsters refuse to cross this radius, so the village stays a haven. */
  villageRadius: 15,
  /** Where the player appears, and where death sends them back to. */
  spawn: [0, 0, 8],
  /** The way back to the portfolio page. */
  portal: { pos: [0, 0, 15], range: 2.6 },
  /** Fog start and end, in metres. */
  fog: [60, 160],
};

/* ---------------- movement and combat ---------------- */

export const play = {
  /** Player walk speed in metres/sec. The fake gait reads as sliding above ~7. */
  playerSpeed: 6,
  npcSpeed: 1.7,
  /** Seconds an NPC waits at each patrol waypoint. */
  npcDwell: 1.6,
  /** Seconds of no progress before an NPC abandons an unreachable waypoint. */
  npcGiveUp: 1.5,
  /** Seconds between player swings. */
  attackCooldown: 0.55,
  /** How far to either side a swing reaches, radians from straight ahead. */
  attackArc: Math.PI * 0.55,
  /** How close you must stand to talk to a villager. */
  talkRange: 3.2,
  /** Seconds before returning home after losing sight of the player. */
  monsterLeash: 4,
  /** Seconds before a monster gives up pushing against a wall. */
  monsterGiveUp: 1.6,
};

/* ---------------- quality tiers ---------------- */

/**
 * Phones choked on the desktop settings, and the worst offender was the shadow
 * map: at 5000 x 5000 it costs about 100 MB of GPU memory and a full extra
 * scene pass, which is enough on its own to stall a mid range phone. Scenery
 * counts matter too, since 500 instanced trees still push millions of vertices
 * per frame, twice over when shadows are on.
 *
 * `scenery` scales every scatter count, so one number thins the whole world.
 */
export const QUALITY = {
  high: {
    id: "high",
    dpr: [1, 1.8],
    shadows: true,
    shadowMap: 2048,
    shadowExtent: 95,
    scenery: 1,
    monsters: 24,
    lights: 8,
    particles: true,
    fog: world.fog,
  },
  medium: {
    id: "medium",
    dpr: [1, 1.4],
    shadows: true,
    shadowMap: 1024,
    shadowExtent: 60,
    scenery: 0.55,
    monsters: 14,
    lights: 6,
    particles: true,
    fog: [45, 110],
  },
  low: {
    id: "low",
    dpr: [0.75, 1],
    shadows: false, // the single biggest win on a phone
    shadowMap: 512,
    shadowExtent: 40,
    scenery: 0.28,
    monsters: 8,
    lights: 4,
    particles: false,
    fog: [30, 75],
  },
};

/**
 * Picks a tier from what the browser will tell us. There is no reliable way to
 * ask "how fast is this GPU", so this leans on coarse pointer (a phone or
 * tablet), core count and memory, all of which are cheap and roughly correlate.
 *
 * Override by hand with ?quality=low|medium|high, which also makes it testable
 * on a desktop.
 */
export function resolveQuality(win = typeof window === "undefined" ? null : window) {
  if (!win) return QUALITY.high;

  try {
    const forced = new URLSearchParams(win.location.search).get("quality");
    if (forced && QUALITY[forced]) return QUALITY[forced];
  } catch {}

  const nav = win.navigator || {};
  const coarse = win.matchMedia?.("(pointer: coarse)").matches ?? false;
  const cores = nav.hardwareConcurrency || 4;
  // Device Memory API, in GiB. Absent on Safari, hence the null check.
  const ram = typeof nav.deviceMemory === "number" ? nav.deviceMemory : null;
  const narrow = Math.min(win.innerWidth || 1024, win.innerHeight || 768) < 500;

  // a phone, or anything that looks starved of cores or memory
  if (coarse && (cores <= 4 || narrow || (ram !== null && ram <= 4))) return QUALITY.low;
  if (coarse) return QUALITY.medium;
  if (cores <= 4) return QUALITY.medium;
  return QUALITY.high;
}

/** Scales a scatter count by the tier, never below a floor of 1. */
export const scaled = (count, factor) => Math.max(1, Math.round(count * factor));
