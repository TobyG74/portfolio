"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Instance, Instances, Sky, useProgress } from "@react-three/drei";
import * as THREE from "three";
import Joystick from "./Joystick";
import PortalParticles from "./PortalParticles";
import Monster from "./Monster";
import RankBoard from "./RankBoard";
import { Animal, angleTo, Building, Character, ModelField } from "./WorldModels";
import Festival from "./Festival";
import { animals, gossips, houses, landmarks, npcs } from "@/lib/npcs";
import {
  BIRTHDAY_GOSSIP,
  FESTIVAL_TITLE,
  birthdayLineFor,
  birthdayShoutFor,
  isBirthday,
} from "@/lib/festival";
import { play, resolveQuality, scaled, world } from "@/lib/config";
import { makeBlockers } from "@/lib/collision";
import QuestBoard from "./QuestBoard";
import { projects } from "@/lib/content";
import {
  CLASSES,
  DEFAULT_CLASS,
  PLAYER_MAX_HP,
  RESPAWN_MS,
  SPAWN_COUNT,
  STARTER,
  WEAPONS,
  blockedReason,
  isClass,
  levelFor,
  levelProgress,
  monsterSpawn,
  playerDamage,
  rankFor,
  weaponFor,
} from "@/lib/game";

// every number below is configured in lib/config.js
const BOUND = world.bound;
const SPEED = play.playerSpeed;
const TALK_RANGE = play.talkRange;
const PORTAL = world.portal;
const SPAWN = world.spawn;
const PARTICLE_ORIGIN = [PORTAL.pos[0], 2, PORTAL.pos[2]];

const CHARACTER_HEIGHT = 1.8;
/**
 * The notice board. The guild hall sits at [0, 0, -23] and is far bigger than
 * it looks: its measured footprint is 6.35 by 8.20 metres either side of its
 * centre, so it reaches out to z = -14.8. The board used to stand at -18.5,
 * which was inside the building. Now it stands clear of the wall and off to
 * one side, away from the guild master's own patrol down the middle.
 */
const BOARD = { pos: [-7.5, 0, -12.5], rot: 0.35, range: 3.4 };
const ATTACK_COOLDOWN = play.attackCooldown;
const ATTACK_ARC = play.attackArc;

/**
 * Buildings block movement as rotated rectangles; the maths lives in
 * lib/collision.js so it can be pinned by a check script. Half extents start
 * as a rough guess from the model height and are replaced by the real
 * footprint once each Building has loaded.
 */
function buildBlockers() {
  const guess = (h) => h * 0.45;
  return makeBlockers([
    ...houses.map((h) => ({ id: h.id, x: h.pos[0], z: h.pos[2], rot: h.rot, hx: guess(h.h), hz: guess(h.h) })),
    ...landmarks.map((l) => ({ id: l.id, x: l.pos[0], z: l.pos[2], rot: l.rot, hx: guess(l.h), hz: guess(l.h) })),
  ]);
}
const charUrl = (name) => `/models/chars/${name}.fbx`;
const buildingUrl = (name) => `/models/buildings/${name}.fbx`;
const animalUrl = (name) => `/models/animals/${name}.glb`;

const NPC_SPEED = play.npcSpeed;
const NPC_DWELL = play.npcDwell;
const NPC_GIVE_UP = play.npcGiveUp;

/* ---------------- player ---------------- */

function Player({
  stick,
  keys,
  frozen,
  onNear,
  onPortal,
  onBoard,
  playerPos,
  playerYaw,
  positions,
  blockers,
  weapon,
  attackRef,
  hurtRef,
  respawnRef,
  model,
  onZone,
}) {
  const root = useRef();
  const moving = useRef(0);
  const nearId = useRef(null);
  const inPortal = useRef(false);
  const nearBoard = useRef(false);
  const safe = useRef(true);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const p = root.current;
    if (!p) return;

    // Death teleports the body, not just the tracking ref. Writing to
    // playerPos alone did nothing, because this loop overwrites it from the
    // group's real position on the very next frame.
    if (respawnRef.current) {
      respawnRef.current = false;
      p.position.set(SPAWN[0], SPAWN[1], SPAWN[2]);
      playerPos.current.copy(p.position);
    }

    // analog stick wins; keyboard is the fallback so both can coexist
    let vx = 0;
    let vy = 0;
    if (!frozen.current) {
      const s = stick.current;
      if (Math.hypot(s.x, s.y) > 0.06) {
        vx = s.x;
        vy = s.y;
      } else {
        const k = keys.current;
        vx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
        vy = (k.up ? 1 : 0) - (k.down ? 1 : 0);
      }
    }

    const magnitude = Math.hypot(vx, vy);
    const len = Math.min(1, magnitude);
    const oldX = p.position.x;
    const oldZ = p.position.z;
    if (len > 0.06) {
      const step = SPEED * dt * len;
      const [nx, nz] = blockers.resolve(
        THREE.MathUtils.clamp(p.position.x + (vx / magnitude) * step, -BOUND, BOUND),
        THREE.MathUtils.clamp(p.position.z - (vy / magnitude) * step, -BOUND, BOUND),
        0.5
      );
      p.position.x = nx;
      p.position.z = nz;
      // model's +Z faces the travel direction (vx, -vy)
      p.rotation.y += angleTo(p.rotation.y, Math.atan2(vx, -vy)) * (1 - Math.exp(-16 * dt));
    }
    moving.current = Math.min(1, Math.hypot(p.position.x - oldX, p.position.z - oldZ) / (SPEED * dt || 1));
    playerPos.current.copy(p.position);
    playerYaw.current = p.rotation.y;
    const inVillage = Math.hypot(p.position.x, p.position.z) < world.villageRadius;
    if (inVillage !== safe.current) {
      safe.current = inVillage;
      onZone(inVillage);
    }

    // chase cam
    const cam = state.camera;
    cam.position.lerp(tmp.set(p.position.x, 11, p.position.z + 13), 1 - Math.exp(-6 * dt));
    cam.lookAt(p.position.x, 1.2, p.position.z);

    // nearest NPC in range, using live positions since some of them walk
    let found = null;
    for (const n of npcs) {
      const at = positions.current[n.id];
      const dx = p.position.x - (at ? at.x : n.pos[0]);
      const dz = p.position.z - (at ? at.z : n.pos[2]);
      if (dx * dx + dz * dz < TALK_RANGE * TALK_RANGE) {
        found = n.id;
        break;
      }
    }
    if (found !== nearId.current) {
      nearId.current = found;
      onNear(found);
    }

    const px = p.position.x - PORTAL.pos[0];
    const pz = p.position.z - PORTAL.pos[2];
    const atPortal = px * px + pz * pz < PORTAL.range * PORTAL.range;
    if (atPortal !== inPortal.current) {
      inPortal.current = atPortal;
      onPortal(atPortal);
    }

    const bx = p.position.x - BOARD.pos[0];
    const bz = p.position.z - BOARD.pos[2];
    const atBoard = bx * bx + bz * bz < BOARD.range * BOARD.range;
    if (atBoard !== nearBoard.current) {
      nearBoard.current = atBoard;
      onBoard(atBoard);
    }
  });

  return (
    <group ref={root} position={SPAWN}>
      <Character
        url={charUrl(model)}
        height={CHARACTER_HEIGHT}
        movingRef={moving}
        weapon={weapon}
        attackRef={attackRef}
        hurtRef={hurtRef}
      />
    </group>
  );
}

/* ---------------- npc ---------------- */

function Npc({ npc, near, onTalk, playerPos, positions, blockers, festive }) {
  const root = useRef(); // holds both position and facing, so labels travel too
  const body = useRef();
  const mark = useRef();
  const moving = useRef(false);
  const waypoint = useRef(0);
  const dwell = useRef(0);
  const stuck = useRef(0); // seconds spent failing to make progress
  const wasFrom = useRef(Infinity); // distance to the waypoint last frame
  const [showLabel, setShowLabel] = useState(false);

  // the world position is published here every frame; Player reads it for
  // proximity, since a walking NPC is no longer where npc.pos says it is
  const live = useMemo(() => new THREE.Vector3(npc.pos[0], 0, npc.pos[2]), [npc]);
  useEffect(() => {
    positions.current[npc.id] = live;
  }, [npc.id, live, positions]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    dt = Math.min(dt, 0.05);
    const g = root.current;
    if (!g) return;

    if (mark.current) {
      mark.current.position.y = 2.65 + Math.sin(t * 3) * 0.16;
      mark.current.rotation.y += dt * 1.8;
      mark.current.visible = near;
    }

    // Always push out of buildings, not only while walking. An NPC that starts
    // the day standing inside a wall used to stay there forever, because the
    // only call to resolve() was on the movement branch.
    {
      const [fx, fz] = blockers.resolve(g.position.x, g.position.z, 0.45);
      g.position.x = fx;
      g.position.z = fz;
    }

    let want = null;

    if (near) {
      // stop and turn to whoever walked up
      moving.current = false;
      want = Math.atan2(playerPos.current.x - g.position.x, playerPos.current.z - g.position.z);
    } else if (npc.patrol) {
      if (dwell.current > 0) {
        dwell.current -= dt;
        moving.current = false;
      } else {
        const [tx, tz] = npc.patrol[waypoint.current];
        const dx = tx - g.position.x;
        const dz = tz - g.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.25) {
          waypoint.current = (waypoint.current + 1) % npc.patrol.length;
          dwell.current = NPC_DWELL;
          moving.current = false;
          stuck.current = 0;
          wasFrom.current = Infinity;
        } else {
          const step = Math.min(d, NPC_SPEED * dt);
          const [nx, nz] = blockers.resolve(
            g.position.x + (dx / d) * step,
            g.position.z + (dz / d) * step,
            0.45
          );
          moving.current = Math.min(1, Math.hypot(nx - g.position.x, nz - g.position.z) / (NPC_SPEED * dt || 1));
          g.position.x = nx;
          g.position.z = nz;
          want = Math.atan2(dx, dz);

          // A waypoint behind a wall cannot be reached, and pressing into the
          // wall looks like walking on the spot. Give up and take the next one.
          if (d > wasFrom.current - 0.01) stuck.current += dt;
          else stuck.current = 0;
          wasFrom.current = d;

          if (stuck.current > NPC_GIVE_UP) {
            waypoint.current = (waypoint.current + 1) % npc.patrol.length;
            dwell.current = NPC_DWELL;
            stuck.current = 0;
            wasFrom.current = Infinity;
            moving.current = false;
          }
        }
      }
    } else {
      moving.current = false;
    }

    if (want !== null) g.rotation.y += angleTo(g.rotation.y, want) * (1 - Math.exp(-5 * dt));
    live.copy(g.position);
    const visible = Math.hypot(playerPos.current.x - g.position.x, playerPos.current.z - g.position.z) < 7;
    if (visible !== showLabel) setShowLabel(visible);
  });

  return (
    <group ref={root} position={npc.pos} onClick={onTalk}>
      <group ref={body}>
        <Character url={charUrl(npc.model)} height={CHARACTER_HEIGHT} movingRef={moving} walkCadence={5} />
      </group>

      {/* quest marker */}
      <mesh ref={mark} position={[0, 2.65, 0]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color="#ffc93c" emissive="#ffc93c" emissiveIntensity={1.2} />
      </mesh>

      {showLabel && <Html
        center
        position={[0, 2.5, 0]}
        distanceFactor={10}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="flex flex-col items-center gap-1">
          {/* on the birthday every villager calls out to Beliau, all day */}
          {festive && (
            <div className="world-label relative bg-primary px-2 py-1 font-mono text-xs text-text">
              🎉 {npc.shout || birthdayShoutFor(npc.id)}
              {/* little tail, so it reads as speech rather than a second label */}
              <span className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-black bg-primary" />
            </div>
          )}
          <div
            className={`world-label px-2 py-1 font-pixel text-xs ${
              near ? "bg-primary text-text" : "bg-void text-ghost"
            }`}
          >
            {npc.name}
          </div>
        </div>
      </Html>}
    </group>
  );
}

/* ---------------- combat ---------------- */

/**
 * Drives the attack swing and resolves hits. Lives inside the Canvas because
 * it needs the frame loop; the world outside only sees the XP it hands back.
 */
function Combat({
  attackRef,
  requestRef,
  cooldownRef,
  playerPos,
  playerYaw,
  monsters,
  level,
  owned,
  onKill,
}) {
  const timer = useRef(0);
  const struck = useRef(false);

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05);
    cooldownRef.current = Math.max(0, cooldownRef.current - dt);

    if (requestRef.current && timer.current === 0 && cooldownRef.current === 0) {
      timer.current = ATTACK_COOLDOWN;
      cooldownRef.current = ATTACK_COOLDOWN;
      struck.current = false;
    }
    requestRef.current = false;

    if (timer.current === 0) {
      attackRef.current = 0;
      return;
    }

    timer.current = Math.max(0, timer.current - dt);
    const progress = 1 - timer.current / ATTACK_COOLDOWN;
    attackRef.current = progress;

    // the blow lands at the bottom of the swing, not the moment of the press
    if (!struck.current && progress >= 0.5) {
      struck.current = true;
      const reach = weaponFor(owned).reach;
      const damage = playerDamage(level, owned);
      const p = playerPos.current;
      const loot = { xp: 0, gold: 0, count: 0 };

      for (const api of monsters.current.values()) {
        const at = api.position();
        if (!at || api.isDead()) continue;
        const dx = at.x - p.x;
        const dz = at.z - p.z;
        if (Math.hypot(dx, dz) > reach) continue;
        // only what the player is facing: angleTo returns the shortest turn
        if (Math.abs(angleTo(playerYaw.current, Math.atan2(dx, dz))) > ATTACK_ARC) continue;

        const kill = api.hit(damage);
        if (kill) {
          loot.xp += kill.xp;
          loot.gold += kill.gold;
          loot.count += 1;
        }
      }

      if (loot.count > 0) onKill(loot);
    }
  });

  return null;
}

/* ---------------- gossiping villagers ---------------- */

const GOSSIP_BEAT = 3800; // ms one villager holds the floor

function Gossip({ spot, festive }) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setBeat((b) => b + 1), GOSSIP_BEAT);
    return () => clearInterval(id);
  }, []);

  const speakingA = beat % 2 === 0;
  const round = Math.floor(beat / 2);
  const who = speakingA ? spot.a : spot.b;

  // On the birthday the pair swaps its usual talk for the celebration, using
  // ITS OWN festive lines. Reading from one shared pool made every pair on the
  // map recite the same exchange in step, which is what looked like a bug.
  const script = festive ? who.festive || BIRTHDAY_GOSSIP.map((p) => p[speakingA ? 0 : 1]) : who.lines;
  const line = script[round % script.length];

  return (
    <group position={spot.pos} rotation={[0, spot.rot, 0]}>
      {/* the pair turn to face each other: +Z is the model's front */}
      <group position={[-0.8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Character url={charUrl(spot.a.model)} height={CHARACTER_HEIGHT} />
      </group>
      <group position={[0.8, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Character url={charUrl(spot.b.model)} height={CHARACTER_HEIGHT} />
      </group>

      <Html
        center
        position={[speakingA ? -0.8 : 0.8, 2.5, 0]}
        distanceFactor={10}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="hud pixel-corner w-56 px-2.5 py-2 text-center font-mono text-[0.72rem] leading-snug text-ghost">
          {line}
        </div>
      </Html>
    </group>
  );
}

/* ---------------- village ---------------- */

function House({ h, blockers }) {
  const report = useCallback((hx, hz) => blockers.set(h.id, hx, hz), [blockers, h.id]);

  return (
    <group position={h.pos} rotation={[0, h.rot, 0]}>
      <Building url={buildingUrl(h.model)} height={h.h} onFootprint={report} />

      <Html
        center
        position={[0, h.h + 1.1, 0]}
        distanceFactor={10}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="world-label bg-void px-2 py-1 font-pixel text-xs text-ghost">
          🏠 {h.owner}
        </div>
      </Html>
    </group>
  );
}

/** An unmanned building: same collision reporting, no sign, no owner. */
function Landmark({ l, blockers }) {
  const report = useCallback((hx, hz) => blockers.set(l.id, hx, hz), [blockers, l.id]);

  return (
    <group position={l.pos} rotation={[0, l.rot, 0]}>
      <Building url={buildingUrl(l.model)} height={l.h} onFootprint={report} />
    </group>
  );
}

/* ---------------- portal ---------------- */

function Portal({ active, onEnter }) {
  const ring = useRef();
  const core = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z += dt * 0.8;
    if (core.current) {
      core.current.material.opacity = 0.35 + Math.sin(t * 3) * 0.12 + (active ? 0.25 : 0);
      core.current.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
    }
  });

  return (
    <group position={PORTAL.pos} onClick={onEnter}>
      {/* frame */}
      <mesh ref={ring} position={[0, 2, 0]} castShadow>
        <torusGeometry args={[1.7, 0.18, 10, 36]} />
        <meshStandardMaterial
          color={active ? "#ffc93c" : "#ff4fd8"}
          emissive={active ? "#ffc93c" : "#ff4fd8"}
          emissiveIntensity={active ? 1.4 : 0.7}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      {/* swirling gate */}
      <mesh ref={core} position={[0, 2, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial
          color="#22e8ff"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* base pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[1.2, 2.2, 32]} />
        <meshBasicMaterial color="#ff4fd8" transparent opacity={active ? 0.5 : 0.22} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 2, 0]} intensity={active ? 60 : 30} distance={14} color="#ff4fd8" />

      <Html
        center
        position={[0, 4.1, 0]}
        distanceFactor={9}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className={`world-label px-2 py-1 font-pixel text-xs ${active ? "bg-primary text-text" : "bg-secondary text-ghost"}`}>
          PORTAL ▸ PORTFOLIO
        </div>
      </Html>
    </group>
  );
}

/* ---------------- environment ---------------- */

const BLADES = ["#3f8a45", "#4c9c4f", "#357a3d", "#5aab58"];

/**
 * Plants from EnvironomentPackV_2. `h` is the height each is normalized to and
 * `weight` how often it turns up, so cheap bushes carpet the ground while the
 * 11k vertex flowering ones stay occasional.
 */
const PLANTS = [
  { model: "Bush_01", h: 0.75, weight: 7 },
  { model: "Plant_02", h: 0.7, weight: 5 },
  { model: "Plant_05", h: 0.8, weight: 4 },
  { model: "Mushroom_01", h: 0.35, weight: 4 },
  { model: "Mushroom_03", h: 0.3, weight: 3 },
  { model: "Flower_01", h: 0.4, weight: 4 },
  { model: "Flower_03", h: 0.35, weight: 4 },
  { model: "BushFruitsRed", h: 0.65, weight: 3 },
  { model: "Bush_02", h: 0.85, weight: 2 },
  { model: "BushFlowers", h: 0.9, weight: 1 },
  { model: "BushRedFlowers", h: 0.9, weight: 1 },
  { model: "BushBlueFlowers", h: 0.9, weight: 1 },
];

/** Trees and rocks from Environoment Pack V.1, scattered the same way. */
const TREES = [
  { model: "Tree_Green_01", h: 6.5, weight: 5 },
  { model: "Tree_Green_03", h: 6, weight: 4 },
  { model: "Tree_Green_02", h: 7.5, weight: 2 },
  { model: "WizardTree", h: 8.5, weight: 1 },
  { model: "Trunk_01", h: 0.9, weight: 2 },
  { model: "Trunk_02", h: 0.7, weight: 2 },
];

const ROCKS = [
  { model: "Rock_01", h: 1.1, weight: 4 },
  { model: "Rock_02", h: 1.6, weight: 3 },
  { model: "Rock_03", h: 1.2, weight: 4 },
  { model: "Rock_04", h: 0.8, weight: 4 },
  { model: "Rock_05", h: 1.8, weight: 2 },
  { model: "Rock_06", h: 0.6, weight: 5 },
];

const totalWeight = (list) => list.reduce((sum, p) => sum + p.weight, 0);

/** Picks an index from a weighted catalogue. */
function weightedPick(list, total, roll) {
  let pick = roll * total;
  for (let i = 0; i < list.length; i++) {
    pick -= list[i].weight;
    if (pick <= 0) return i;
  }
  return list.length - 1;
}

const PLANT_TOTAL_WEIGHT = totalWeight(PLANTS);
const TREE_TOTAL_WEIGHT = totalWeight(TREES);
const ROCK_TOTAL_WEIGHT = totalWeight(ROCKS);

/* deterministic PRNG so the forest is identical on every render/HMR */
function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scatters trees, grass tufts and crystals once. Everything is drawn through
 * drei <Instances>, so ~900 props cost 5 draw calls instead of 900.
 */
function useScatter(quality) {
  const density = quality.scenery;
  return useMemo(() => {
    const rnd = mulberry32(20260729);
    const keepout = [
      ...npcs.map((n) => [n.pos[0], n.pos[2], 1]),
      ...npcs.flatMap((n) => (n.patrol || []).map(([x, z]) => [x, z, 1])),
      ...gossips.map((g) => [g.pos[0], g.pos[2], 1.5]),
      ...houses.map((h) => [h.pos[0], h.pos[2], h.h * 0.6]),
      ...landmarks.map((l) => [l.pos[0], l.pos[2], l.h * 0.6]),
      [PORTAL.pos[0], PORTAL.pos[2], 1],
      [BOARD.pos[0], BOARD.pos[2], 2.5], // nothing grows through the notice board
      [SPAWN[0], SPAWN[2], 1],
    ];
    // `extra` widens the clearance around bulky things like houses
    const clear = (x, z, pad) =>
      Math.abs(x) > 2.5 && Math.abs(z) > 2.5 &&
      keepout.every(([kx, kz, extra]) => (x - kx) ** 2 + (z - kz) ** 2 > (pad + extra) ** 2);

    const trees = TREES.map(() => []);
    const rocks = ROCKS.map(() => []);
    const grass = [];
    const crystals = [];

    // ponytail: rejection sampling with a hard attempt cap — the annulus is
    // roomy, the cap only exists so a tighter keepout can never hang the loop
    // counts scale with the quality tier: a phone gets a thinner forest
    const wantTrees = scaled(520, density);
    const wantRocks = scaled(180, density);
    const wantGrass = scaled(3000, density);
    const wantPlants = scaled(780, density);

    let planted = 0;
    for (let i = 0; i < 30000 && planted < wantTrees; i++) {
      const x = (rnd() * 2 - 1) * 92;
      const z = (rnd() * 2 - 1) * 92;
      const r = Math.hypot(x, z);
      if (r < 23 || r > 92) continue;
      if (!clear(x, z, 5)) continue;
      trees[weightedPick(TREES, TREE_TOTAL_WEIGHT, rnd())].push({
        x,
        z,
        rot: rnd() * Math.PI * 2,
        s: 0.8 + rnd() * 0.6,
      });
      planted += 1;
    }

    let stones = 0;
    for (let i = 0; i < 16000 && stones < wantRocks; i++) {
      const x = (rnd() * 2 - 1) * 90;
      const z = (rnd() * 2 - 1) * 90;
      const r = Math.hypot(x, z);
      if (r < 12 || r > 90) continue;
      if (!clear(x, z, 2.2)) continue;
      rocks[weightedPick(ROCKS, ROCK_TOTAL_WEIGHT, rnd())].push({
        x,
        z,
        rot: rnd() * Math.PI * 2,
        s: 0.7 + rnd() * 0.9,
      });
      stones += 1;
    }

    for (let i = 0; i < 34000 && grass.length < wantGrass; i++) {
      const x = (rnd() * 2 - 1) * 92;
      const z = (rnd() * 2 - 1) * 92;
      if (Math.hypot(x, z) < world.plaza || Math.hypot(x, z) > 92) continue;
      if (!clear(x, z, 1.3)) continue;
      grass.push({
        x,
        z,
        s: 0.55 + rnd() * 0.95,
        rot: rnd() * Math.PI,
        tilt: (rnd() - 0.5) * 0.4,
        tone: BLADES[Math.floor(rnd() * BLADES.length)],
      });
    }

    // plants: one bucket of spots per model, chosen by weight
    const plants = PLANTS.map(() => []);
    let sprouted = 0;
    for (let i = 0; i < 34000 && sprouted < wantPlants; i++) {
      const x = (rnd() * 2 - 1) * 88;
      const z = (rnd() * 2 - 1) * 88;
      if (Math.hypot(x, z) < world.plaza || Math.hypot(x, z) > 88) continue;
      if (!clear(x, z, 1.1)) continue;
      plants[weightedPick(PLANTS, PLANT_TOTAL_WEIGHT, rnd())].push({
        x,
        z,
        rot: rnd() * Math.PI * 2,
        s: 0.75 + rnd() * 0.6,
      });
      sprouted += 1;
    }

    const wantCrystals = scaled(38, density);
    for (let i = 0; i < wantCrystals; i++) {
      const a = (i / wantCrystals) * Math.PI * 2 + rnd();
      const r = 20 + rnd() * 62;
      crystals.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 1.6 + rnd() * 1.6,
        rot: rnd() * Math.PI,
        color: ["#ff4fd8", "#22e8ff", "#a6ff3d"][i % 3],
      });
    }

    return { trees, rocks, grass, crystals, plants };
  }, [density]);
}

function Environment({ quality }) {
  const { trees, rocks, grass, crystals, plants } = useScatter(quality);

  return (
    <group>
      {/* grass tufts */}
      <Instances limit={grass.length} frames={1} frustumCulled={false}>
        <coneGeometry args={[0.1, 0.55, 4]} />
        <meshStandardMaterial roughness={1} />
        {grass.map((g, i) => (
          <Instance
            key={i}
            position={[g.x, 0.27 * g.s, g.z]}
            rotation={[g.tilt, g.rot, g.tilt]}
            scale={[g.s, g.s * 1.3, g.s]}
            color={g.tone}
          />
        ))}
      </Instances>

      {/* real trees, rocks and plants; each field is one draw call per
          material group, so hundreds of props cost a handful of calls */}
      <Suspense fallback={null}>
        {TREES.map((t, i) =>
          trees[i].length ? (
            <ModelField
              key={t.model}
              url={`/models/env/${t.model}.fbx`}
              height={t.h}
              spots={trees[i]}
            />
          ) : null
        )}

        {ROCKS.map((r, i) =>
          rocks[i].length ? (
            <ModelField
              key={r.model}
              url={`/models/env/${r.model}.fbx`}
              height={r.h}
              spots={rocks[i]}
            />
          ) : null
        )}

        {PLANTS.map((p, i) =>
          plants[i].length ? (
            <ModelField
              key={p.model}
              url={`/models/plants/${p.model}.fbx`}
              height={p.h}
              spots={plants[i]}
            />
          ) : null
        )}
      </Suspense>

      {/* neon crystals — the arcade still lives here */}
      <Instances limit={crystals.length} frames={1} castShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.25} metalness={0.4} emissiveIntensity={0.5} flatShading />
        {crystals.map((c, i) => (
          <Instance
            key={i}
            position={[c.x, c.h * 0.6, c.z]}
            rotation={[0, c.rot, 0.2]}
            scale={[0.7, c.h, 0.7]}
            color={c.color}
          />
        ))}
      </Instances>
    </group>
  );
}

/* ---------------- dialogue ---------------- */

function useTypewriter(text, speed = 16) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return [out, () => setOut(text)];
}

/** The blacksmith's stall. Rendered inside his dialogue box. */
function Shop({ level, gold, owned, equipped, onBuy }) {
  return (
    <div className="mt-4 border-t-2 border-white/10 pt-3">
      <div className="mb-2 flex items-center justify-between font-pixel text-[0.5rem]">
        <span className="text-gold">⚒ TEMPA MASTER FORGE</span>
        <span className="text-gold">🪙 {gold}</span>
      </div>

      {/* the wider card fits two columns of stock without scrolling as much */}
      <div className="grid max-h-44 gap-2 overflow-y-auto p-1 sm:max-h-40 sm:grid-cols-2">
        {WEAPONS.map((w) => {
          const reason = blockedReason(w, { level, gold, owned });
          const isEquipped = equipped.id === w.id;
          return (
            <div
              key={w.id}
              className={`flex items-center gap-2 border-2 border-black px-2 py-2 ${
                isEquipped ? "bg-secondary" : "bg-void"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[0.7rem] text-white">{w.name}</span>
                <span className="block font-mono text-[0.6rem] text-ghost/50">
                  {w.damage} serang · jangkauan {w.reach} m
                </span>
              </span>

              {isEquipped ? (
                <span className="shrink-0 font-pixel text-[0.45rem] text-gold">TERPASANG</span>
              ) : reason === "DIMILIKI" ? (
                <span className="shrink-0 font-pixel text-[0.45rem] text-ghost/50">DIMILIKI</span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!reason) onBuy(w);
                  }}
                  disabled={Boolean(reason)}
                  className="shrink-0 border-2 border-aqua/50 px-2 py-1 font-pixel text-[0.45rem] text-aqua transition-colors hover:bg-aqua/15 disabled:border-white/10 disabled:text-ghost/40"
                >
                  {reason || `${w.price} 🪙`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Lines for the open topic, or the NPC's default script when it has no menu.
 * On the birthday every villager leads with a greeting for Beliau, prepended
 * rather than replacing anything, so no dialogue is lost for the day.
 */
function scriptFor(npc, topic, festive) {
  if (topic && npc.topics?.[topic]) return npc.topics[topic];
  if (npc.menu) return [festive ? birthdayLineFor(npc.id) : npc.greeting || "Ada perlu apa?"];
  return festive ? [birthdayLineFor(npc.id), ...npc.lines] : npc.lines;
}

function Dialogue({ npc, index, topic, onAdvance, onClose, onPick, onBack, shop, festive }) {
  const script = scriptFor(npc, topic, festive);
  const choosing = Boolean(npc.menu) && !topic;
  const shopping = topic === "shop";

  const text = script[Math.min(index, script.length - 1)];
  const [typed, finish] = useTypewriter(text);
  const done = typed.length >= text.length;
  const last = index >= script.length - 1;

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 p-2 sm:px-4 sm:pb-4">
      <div
        onClick={() => {
          // a menu or the stall waits for a button, it must not advance on a tap
          if (choosing || shopping) return;
          if (done) onAdvance();
          else finish();
        }}
        className={`world-dialogue hud pixel-corner pixel-shadow mx-auto w-full max-w-[min(96rem,96vw)] px-4 py-3.5 sm:px-7 sm:py-4 ${
          choosing || shopping ? "" : "cursor-pointer"
        }`}
      >
        <div className="mb-2.5 flex items-center gap-2.5 border-b-2 border-white/10 pb-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-aqua/50 bg-void text-base">
            {npc.face}
          </span>
          <div className="min-w-0">
            <p className="truncate font-pixel text-[0.52rem] text-aqua">{npc.name}</p>
            <p className="mt-1 font-mono text-[0.6rem] text-ghost/50">{npc.role}</p>
          </div>
          {npc.menu && topic && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="ml-auto shrink-0 border-2 border-white/20 px-2 py-1 font-pixel text-[0.5rem] text-ghost hover:border-aqua hover:text-aqua"
            >
              ◀ KEMBALI
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`shrink-0 border-2 border-white/20 px-2 py-1 font-pixel text-[0.5rem] text-ghost hover:border-hp hover:text-hp ${
              npc.menu && topic ? "" : "ml-auto"
            }`}
          >
            ESC
          </button>
        </div>

        <p
          className={`text-sm leading-relaxed text-ghost ${
            choosing || shopping ? "" : "min-h-[3rem]"
          }`}
        >
          {typed}
        </p>

        {/* topic picker: two across on a wide card, stacked on a phone */}
        {choosing && done && (
          <div className="mt-3 grid gap-2 border-t-2 border-white/10 pt-3 sm:grid-cols-2">
            {npc.menu.map((m) => (
              <button
                key={m.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onPick(m.id);
                }}
                className="group flex items-center gap-3 border-2 border-white/12 px-3 py-2.5 text-left transition-colors hover:border-aqua hover:bg-aqua/5"
              >
                <span className="shrink-0 font-pixel text-[0.5rem] text-aqua opacity-0 transition-opacity group-hover:opacity-100">
                  ▶
                </span>
                <span className="min-w-0">
                  <span className="block font-pixel text-[0.55rem] text-white">{m.label}</span>
                  {m.hint && (
                    <span className="mt-1 block font-mono text-[0.62rem] text-ghost/50">{m.hint}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {shop && shopping && <Shop {...shop} />}

        {!choosing && !shopping && last && done && npc.links?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-white/10 pt-4">
            {npc.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="border-2 border-gold/50 px-3 py-2 font-pixel text-[0.5rem] text-gold transition-colors hover:bg-gold/15"
              >
                ▸ {l.label}
              </a>
            ))}
          </div>
        )}

        {!choosing && !shopping && (
          <div className="mt-3 flex items-center justify-between font-pixel text-[0.5rem] text-ghost/50">
            <span>
              {index + 1} / {script.length}
            </span>
            <span className="animate-blink text-gold">
              {done ? (last ? (npc.menu ? "▼ KEMBALI" : "▼ TUTUP") : "▼ LANJUT") : "..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function WorldDialog({ children, className, labelledBy, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    dialog.focus({ preventScroll: true });
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      className={`world-dialog hud pixel-corner pixel-shadow ${className}`}
      onKeyDown={(e) => e.stopPropagation()}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
    >
      {children}
    </dialog>
  );
}

/** The board's own panel: every project, with a way through to each repo. */
function BoardPanel({ onClose }) {
  return (
    <WorldDialog labelledBy="world-board-title" onClose={onClose} className="max-w-6xl p-4 sm:p-6">
      <div className="mb-3 flex shrink-0 items-center gap-3 border-b-2 border-white/10 pb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-gold/50 bg-void text-base">
          📜
        </span>
        <div className="min-w-0">
          <h2 id="world-board-title" className="font-pixel text-[0.55rem] text-gold">PAPAN MISI BELIAU</h2>
          <p className="mt-1 font-mono text-[0.62rem] text-ghost/50">
            {projects.length} misi yang tercatat di serikat
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup papan misi"
          className="ml-auto shrink-0 border-2 border-white/20 px-2 py-1 font-pixel text-[0.5rem] text-ghost hover:border-hp hover:text-hp"
        >
          ESC
        </button>
      </div>

      <div className="grid min-h-0 gap-3 overflow-y-auto p-1 sm:grid-cols-2">
        {projects.map((p) => (
          <a
            key={p.id ?? p.title}
            href={p.link}
            target="_blank"
            rel="noreferrer"
            className="world-project group flex min-w-0 gap-3 p-3"
          >
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="h-16 w-16 shrink-0 border-2 border-black object-cover sm:w-24"
              />
            )}
            <span className="min-w-0">
              <span className="block break-words text-sm font-bold text-ghost">{p.title}</span>
              <span className="mt-1 text-xs leading-relaxed text-ghost line-clamp-3">
                {p.description}
              </span>
              <span className="mt-2 flex flex-wrap gap-1">
                {(p.tags || []).slice(0, 3).map((t) => (
                  <span key={t} className="border-2 border-black bg-primary px-2 py-1 font-mono text-xs text-text">
                    {t}
                  </span>
                ))}
              </span>
            </span>
          </a>
        ))}
      </div>
    </WorldDialog>
  );
}

/* ---------------- first visit popup ---------------- */

function Intro({ initialName, initialClass, claimedName, onStart }) {
  const [value, setValue] = useState(claimedName || initialName || "");
  const [picked, setPicked] = useState(initialClass || DEFAULT_CLASS);
  const clean = value.trim();
  const locked = Boolean(claimedName);

  // the claim can arrive after the popup is already open
  useEffect(() => {
    if (claimedName) setValue(claimedName);
  }, [claimedName]);

  return (
    <WorldDialog labelledBy="world-intro-title" className="max-w-lg p-5 sm:p-7">
      <p className="font-pixel text-[0.55rem] text-gold">▶ PESAN UNTUK PENGEMBARA BARU</p>
      <h2 id="world-intro-title" className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        Selamat datang di Tobiverse.
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-ghost">
        Laman ini bukan portfolio biasa. Anda sedang berdiri di dalam wilayah Beliau,{" "}
        <span className="text-white">Tobi Saputra</span>. Penduduk desa akan menceritakan siapa Beliau
        bila Anda menyapa mereka satu per satu.
      </p>

      <ul className="mt-5 space-y-2 font-mono text-[0.78rem] text-ghost">
        <li className="flex gap-3">
          <span className="shrink-0 font-pixel text-[0.5rem] text-aqua">JALAN</span>
          Analog di sudut kiri bawah, atau tombol WASD dan panah.
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 font-pixel text-[0.5rem] text-aqua">BICARA</span>
          Dekati penduduk hingga namanya menyala keemasan, lalu tekan E.
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 font-pixel text-[0.5rem] text-hp">BURU</span>
          Tekan spasi atau tombol SERANG. Tiap monster memberi XP, dan tingkat
          Anda menentukan senjata yang terpasang.
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 font-pixel text-[0.5rem] text-aqua">KELUAR</span>
          Masuki portal ungu di selatan untuk pindah ke laman portfolio.
        </li>
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart(value, picked);
        }}
        className="mt-6"
      >
        <label htmlFor="world-player-name" className="mb-2 block font-pixel text-[0.5rem] uppercase text-ghost/60">
          Nama Anda di papan peringkat
        </label>
        <input
          id="world-player-name"
          value={value}
          maxLength={18}
          readOnly={locked}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ketik nama pengembara"
          className={`w-full border-2 px-4 py-3 text-sm outline-none transition-colors placeholder:text-ghost/40 ${
            locked
              ? "cursor-not-allowed border-gold/40 bg-gold/5 text-gold"
              : "border-white/15 bg-white/[0.04] text-white focus:border-aqua"
          }`}
        />
        {locked && (
          <p className="mt-2 font-mono text-[0.6rem] text-ghost/50">
            Perangkat ini sudah punya karakter, jadi namanya dipakai kembali. Satu nama untuk satu
            perangkat, supaya papan peringkat tidak dipenuhi nama ganda.
          </p>
        )}

        <p id="world-class-label" className="mb-2 mt-5 block font-pixel text-[0.5rem] uppercase text-ghost/60">
          Pilih wujud Anda
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-labelledby="world-class-label">
          {CLASSES.map((c) => (
            <button
              key={c.model}
              type="button"
              aria-pressed={picked === c.model}
              onClick={() => setPicked(c.model)}
              className={`flex min-w-0 flex-col items-center gap-1.5 border-2 px-2 py-2.5 transition-colors ${
                picked === c.model
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/12 text-ghost hover:border-aqua/50"
              }`}
            >
              <span className="text-lg">{c.face}</span>
              <span className="max-w-full break-words font-pixel text-[0.45rem] leading-normal">{c.name}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[0.6rem] text-ghost/40">
          Pilihan ini soal rupa. Kekuatan Anda datang dari senjata dan tingkat, bukan wujud.
        </p>

        <button
          type="submit"
          disabled={!clean}
          className="btn-arcade mt-4 w-full bg-aqua px-5 py-3.5 text-void disabled:cursor-not-allowed disabled:opacity-40"
        >
          MULAI PETUALANGAN
        </button>
      </form>
    </WorldDialog>
  );
}

/* ---------------- world ---------------- */

function WorldLoading() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div role="status" className="hud pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 px-3 py-2 font-mono text-xs text-ghost">
      Menyiapkan dunia {Math.round(progress)}%
    </div>
  );
}

export default function RpgWorld() {
  const router = useRouter();
  const stick = useRef({ x: 0, y: 0 });
  const keys = useRef({ up: false, down: false, left: false, right: false });
  const frozen = useRef(false);
  const playerPos = useRef(new THREE.Vector3(SPAWN[0], 0, SPAWN[2]));
  const playerYaw = useRef(0);
  const npcPositions = useRef({});
  const blockers = useMemo(buildBlockers, []);
  // read once per mount: nobody keeps the tab open across midnight on purpose
  const festive = useMemo(() => isBirthday(), []);
  // one device probe per mount, since none of its inputs change mid session
  const quality = useMemo(() => resolveQuality(), []);

  // combat plumbing: refs so the frame loop never waits on a re-render
  const attackRef = useRef(0);
  const attackRequest = useRef(false);
  const attackCooldown = useRef(0);
  const monsterApi = useRef(new Map());
  const playerHurt = useRef(0); // 1 on impact, decayed by the Character
  const respawnRef = useRef(false); // set on death, consumed by the Player

  const [nearId, setNearId] = useState(null);
  const [atPortal, setAtPortal] = useState(false);
  const [atBoard, setAtBoard] = useState(false);
  const [inVillage, setInVillage] = useState(true);
  const [boardOpen, setBoardOpen] = useState(false);
  const [talkId, setTalkId] = useState(null);
  const [line, setLine] = useState(0);
  const [topic, setTopic] = useState(null); // chosen menu entry, for NPCs that have one

  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("tobz-player-name") || "";
    } catch {
      return "";
    }
  });
  const [xp, setXp] = useState(() => {
    try {
      return Number(localStorage.getItem("tobz-player-xp")) || 0;
    } catch {
      return 0;
    }
  });
  const [kills, setKills] = useState(() => {
    try {
      return Number(localStorage.getItem("tobz-player-kills")) || 0;
    } catch {
      return 0;
    }
  });
  const [playerClass, setPlayerClass] = useState(() => {
    try {
      const saved = localStorage.getItem("tobz-player-class");
      return isClass(saved) ? saved : DEFAULT_CLASS;
    } catch {
      return DEFAULT_CLASS;
    }
  });
  const [gold, setGold] = useState(() => {
    try {
      return Number(localStorage.getItem("tobz-player-gold")) || 0;
    } catch {
      return 0;
    }
  });
  const [owned, setOwned] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("tobz-player-weapons") || "[]");
      const list = Array.isArray(raw) ? raw.filter((id) => WEAPONS.some((w) => w.id === id)) : [];
      // the starter is always in the inventory, even if storage says otherwise
      return list.includes(STARTER) ? list : [STARTER, ...list];
    } catch {
      return [STARTER];
    }
  });
  const [hp, setHp] = useState(PLAYER_MAX_HP);
  const [boardKey, setBoardKey] = useState(0);
  const [claimedName, setClaimedName] = useState(null); // owned by this IP, if any
  const [hurtPulse, setHurtPulse] = useState(0); // counts blows taken, drives the screen flash
  const [toast, setToast] = useState(null);
  // monster count follows the quality tier: each one carries a skinned mesh and
  // its own animation mixer, so they are the priciest thing in the world
  const [slots, setSlots] = useState(() =>
    Array.from({ length: Math.min(SPAWN_COUNT, resolveQuality().monsters) }, (_, i) => ({
      uid: i,
      gen: 0,
      spawn: monsterSpawn(i, 0, null, blockers.blocked),
    }))
  );

  const level = levelFor(xp);
  const weapon = weaponFor(owned);
  // Read during render, not in the mount effect: StrictMode runs effects twice
  // in dev, and the second run would read the flag the first run just wrote.
  // Safe to touch localStorage here because this component never renders on
  // the server (WorldMount loads it with ssr:false).
  const [intro, setIntro] = useState(() => {
    try {
      // also shown to returning visitors who never picked a name, since the
      // leaderboard cannot list them without one
      return !localStorage.getItem("tobz-world-seen") || !localStorage.getItem("tobz-player-name");
    } catch {
      return false;
    }
  });

  const near = npcs.find((n) => n.id === nearId) || null;
  const talking = npcs.find((n) => n.id === talkId) || null;

  useEffect(() => {
    frozen.current = Boolean(talkId) || intro || boardOpen;
    if (frozen.current) {
      Object.keys(keys.current).forEach((key) => { keys.current[key] = false; });
      stick.current.x = 0;
      stick.current.y = 0;
      attackRequest.current = false;
    }
  }, [talkId, intro, boardOpen]);

  /* ---- progression ---- */

  const register = useCallback((api) => {
    monsterApi.current.set(api.uid, api);
    return () => monsterApi.current.delete(api.uid);
  }, []);

  const flash = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast((t) => (t === text ? null : t)), 2200);
  }, []);

  const onKill = useCallback(
    (loot) => {
      setXp((prev) => {
        const next = prev + loot.xp;
        if (levelFor(next) > levelFor(prev)) {
          flash(`NAIK KE TINGKAT ${levelFor(next)}: ${rankFor(levelFor(next))}`);
        } else {
          flash(`+${loot.xp} XP · +${loot.gold} KOIN`);
        }
        return next;
      });
      setGold((g) => g + loot.gold);
      setKills((k) => k + loot.count);
    },
    [flash]
  );

  const buy = useCallback(
    (w) => {
      if (owned.includes(w.id) || level < w.level || gold < w.price) return;
      setGold((g) => g - w.price);
      setOwned((list) => [...list, w.id]);
      flash(`${w.name} DITEMPA`);
    },
    [owned, level, gold, flash]
  );

  const onHitPlayer = useCallback(
    (amount) => {
      playerHurt.current = 1;
      // bumping the counter remounts the vignette, which restarts its keyframe
      setHurtPulse((p) => p + 1);
      setHp((prev) => {
        const next = prev - amount;
        if (next > 0) return next;
        // knocked out: the Player reads this and teleports home next frame.
        // Health is restored, XP and coins are never lost.
        respawnRef.current = true;
        flash("KAMU TUMBANG. KEMBALI KE DESA.");
        return PLAYER_MAX_HP;
      });
    },
    [flash]
  );

  // Refill distant slots as the player explores; deaths keep their own cooldown.
  useEffect(() => {
    const id = setInterval(() => {
      if (frozen.current) return;
      const p = playerPos.current;
      const now = Date.now();
      setSlots((prev) => {
        let changed = false;
        const next = prev.map((s) => {
          const api = monsterApi.current.get(s.uid);
          const pos = api?.position();
          const refill = !s.spawn || (api?.isDead()
            ? now - api.diedAt() >= RESPAWN_MS
            : pos && Math.hypot(pos.x - p.x, pos.z - p.z) > 42);
          if (!refill) return s;
          const spawn = monsterSpawn(s.uid, s.gen + 1, [p.x, p.z], blockers.blocked);
          if (!spawn) return s;
          changed = true;
          return { uid: s.uid, gen: s.gen + 1, spawn };
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [blockers]);

  // out of combat regeneration, so exploring is not a slow death
  useEffect(() => {
    const id = setInterval(() => setHp((h) => Math.min(PLAYER_MAX_HP, h + 4)), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tobz-player-xp", String(xp));
      localStorage.setItem("tobz-player-kills", String(kills));
      localStorage.setItem("tobz-player-gold", String(gold));
      localStorage.setItem("tobz-player-weapons", JSON.stringify(owned));
    } catch {}
  }, [xp, kills, gold, owned]);

  /**
   * The server ties one character to one connection by IP. Ask it up front
   * what this connection already owns, so a returning visitor gets their
   * character back even after clearing storage, and cannot quietly start a
   * second one.
   */
  useEffect(() => {
    let alive = true;
    fetch("/api/rank")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.you) return;
        setClaimedName(d.you);
        setName((current) => {
          if (current === d.you) return current;
          try {
            localStorage.setItem("tobz-player-name", d.you);
          } catch {}
          return d.you;
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // publish to the shared board, debounced so a killing spree posts once
  useEffect(() => {
    if (!name || xp <= 0) return;
    const id = setTimeout(() => {
      fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, xp, kills }),
      })
        .then(async (r) => {
          const data = await r.json().catch(() => null);
          if (r.status === 409 && data?.you) {
            // this connection already owns a different character; adopt it
            // rather than silently failing to score for the rest of the session
            setClaimedName(data.you);
            setName(data.you);
            try {
              localStorage.setItem("tobz-player-name", data.you);
            } catch {}
            flash(`KARAKTERMU: ${data.you}`);
            return;
          }
          setBoardKey((k) => k + 1);
        })
        .catch(() => {});
    }, 2500);
    return () => clearTimeout(id);
  }, [name, xp, kills, flash]);

  const close = useCallback(() => {
    setTalkId(null);
    setLine(0);
    setTopic(null);
    stick.current = { x: 0, y: 0 }; // the stick unmounts mid-drag; drop its last value
  }, []);

  const open = useCallback((id) => {
    setTalkId(id);
    setLine(0);
    setTopic(null);
    stick.current = { x: 0, y: 0 };
  }, []);

  const pickTopic = useCallback((id) => {
    setTopic(id);
    setLine(0);
  }, []);

  const backToMenu = useCallback(() => {
    setTopic(null);
    setLine(0);
  }, []);

  const advance = useCallback(() => {
    if (!talking) return;
    // the menu and the stall are button driven, advancing must not skip them
    if (talking.menu && !topic) return;
    if (topic === "shop") return;

    const script = topic ? talking.topics?.[topic] || [] : talking.lines || [];
    if (line >= script.length - 1) {
      // an NPC with a menu returns to it, everyone else closes
      if (talking.menu) backToMenu();
      else close();
    } else {
      setLine((i) => i + 1);
    }
  }, [talking, topic, line, close, backToMenu]);

  const enterPortal = useCallback(() => router.push("/"), [router]);

  // one action button: dismiss intro / advance dialogue / talk / enter portal
  const action = useCallback(() => {
    if (intro) return; // the intro needs a name, it has its own button
    if (boardOpen) setBoardOpen(false);
    else if (talkId) advance();
    else if (nearId) open(nearId);
    else if (atBoard) setBoardOpen(true);
    else if (atPortal) enterPortal();
  }, [intro, boardOpen, talkId, nearId, atBoard, atPortal, advance, open, enterPortal]);

  const attack = useCallback(() => {
    if (intro || talkId || boardOpen) return;
    attackRequest.current = true;
  }, [intro, talkId, boardOpen]);

  const startGame = useCallback((chosen, cls) => {
    const clean = chosen.trim().slice(0, 18);
    if (!clean) return;
    const model = isClass(cls) ? cls : DEFAULT_CLASS;
    setName(clean);
    setPlayerClass(model);
    try {
      localStorage.setItem("tobz-player-name", clean);
      localStorage.setItem("tobz-player-class", model);
    } catch {}
    setIntro(false);
  }, []);

  useEffect(() => {
    const KEYMAP = {
      w: "up", ArrowUp: "up",
      s: "down", ArrowDown: "down",
      a: "left", ArrowLeft: "left",
      d: "right", ArrowRight: "right",
    };
    const down = (e) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        setBoardOpen(false);
        close();
        return;
      }
      if (e.target.closest?.("input, textarea, select") || e.target.isContentEditable) return;
      const dir = KEYMAP[e.key] || KEYMAP[e.key.toLowerCase?.()];
      if (dir) {
        if (!frozen.current) keys.current[dir] = true;
        e.preventDefault();
        return;
      }
      if ((e.key === " " || e.key === "Enter") && e.target.closest?.("button, a")) return;
      if (e.key === " ") {
        e.preventDefault();
        attack();
        return;
      }
      if (e.key === "e" || e.key === "E" || e.key === "Enter") {
        e.preventDefault();
        action();
      }
    };
    const up = (e) => {
      const dir = KEYMAP[e.key] || KEYMAP[e.key.toLowerCase?.()];
      if (dir) keys.current[dir] = false;
    };
    const reset = () => Object.keys(keys.current).forEach((key) => { keys.current[key] = false; });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
    };
  }, [action, attack, close]);

  // the world owns the viewport while it is mounted. The flag written here
  // stops the landing page redirecting back into the world (see app/layout.js)
  // and marks the welcome popup as spent.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    try {
      localStorage.setItem("tobz-world-seen", "1");
    } catch {}
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const prompt = talking || intro || boardOpen
    ? null
    : near
    ? `▶ ${near.name} · TEKAN E / TALK`
    : atBoard
    ? "▶ PAPAN MISI · TEKAN E / TALK"
    : atPortal
    ? "▶ MASUK PORTAL · TEKAN E / TALK"
    : null;

  return (
    <div className="fixed inset-0 z-30 bg-void">
      <Canvas
        shadows={quality.shadows}
        dpr={quality.dpr}
        camera={{ position: [0, 13, 20], fov: 45 }}
        gl={{ antialias: quality.id === "high", powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#b8cdd0"]} />
          <fog attach="fog" args={["#b8cdd0", quality.fog[0], quality.fog[1]]} />
          <Sky sunPosition={[40, 35, -60]} turbidity={6} rayleigh={1.2} />

          <ambientLight intensity={0.65} />
          <hemisphereLight args={["#d6edff", "#526b39", 1.1]} />
          <directionalLight
            castShadow={quality.shadows}
            position={[35, 45, -25]}
            color="#ffe4b5"
            intensity={2}
            shadow-bias={-0.0002}
            shadow-normalBias={0.04}
            shadow-mapSize={[quality.shadowMap, quality.shadowMap]}
            shadow-camera-left={-quality.shadowExtent}
            shadow-camera-right={quality.shadowExtent}
            shadow-camera-top={quality.shadowExtent}
            shadow-camera-bottom={-quality.shadowExtent}
          />

          {/* ground + a lighter plaza disc so the play area reads as "here" */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[world.ground, world.ground]} />
            <meshStandardMaterial color="#57784a" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <circleGeometry args={[world.plaza, 48]} />
            <meshStandardMaterial color="#a5916f" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 8]} receiveShadow>
            <planeGeometry args={[3.5, 72]} />
            <meshStandardMaterial color="#b29c78" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
            <planeGeometry args={[48, 3.5]} />
            <meshStandardMaterial color="#b29c78" roughness={1} />
          </mesh>

          <Environment quality={quality} />
          <Portal active={atPortal} onEnter={enterPortal} />
          {quality.particles && <PortalParticles portal={PARTICLE_ORIGIN} />}

          {/* models stream in behind their own boundary so the terrain, the
              portal and the HUD are usable before ~5 MB of FBX has landed */}
          <Suspense fallback={null}>
            {houses.map((h) => (
              <House key={h.id} h={h} blockers={blockers} />
            ))}

            {landmarks.map((l) => (
              <Landmark key={l.id} l={l} blockers={blockers} />
            ))}

            {gossips.map((g) => (
              <Gossip key={g.id} spot={g} festive={festive} />
            ))}

            <QuestBoard
              position={BOARD.pos}
              rot={BOARD.rot}
              near={atBoard}
              onOpen={() => setBoardOpen(true)}
            />

            {festive && <Festival />}

            {animals.map((a, i) => (
              <Animal
                key={a.id}
                url={animalUrl(a.model)}
                height={a.h}
                home={a.pos}
                radius={a.r}
                speed={a.s}
                hop={a.hop}
                seed={i * 1.7}
              />
            ))}
          </Suspense>

          {npcs.map((n) => (
            <Suspense key={n.id} fallback={null}>
              <Npc
                npc={n}
                near={nearId === n.id}
                onTalk={() => open(n.id)}
                playerPos={playerPos}
                positions={npcPositions}
                blockers={blockers}
                festive={festive}
              />
            </Suspense>
          ))}

          {slots.map((s) => {
            if (!s.spawn) return null;
            const { spec, at } = s.spawn;
            return (
              <Suspense key={`${s.uid}-${s.gen}`} fallback={null}>
                <Monster
                  spec={{ ...spec, uid: s.uid }}
                  spawn={at}
                  playerPos={playerPos}
                  onHitPlayer={onHitPlayer}
                  register={register}
                  blockers={blockers}
                  frozen={frozen}
                />
              </Suspense>
            );
          })}

          <Suspense fallback={null}>
            <Player
              stick={stick}
              keys={keys}
              frozen={frozen}
              onNear={setNearId}
              onPortal={setAtPortal}
              onBoard={setAtBoard}
              playerPos={playerPos}
              playerYaw={playerYaw}
              positions={npcPositions}
              blockers={blockers}
              weapon={weapon}
              attackRef={attackRef}
              hurtRef={playerHurt}
              respawnRef={respawnRef}
              model={playerClass}
              onZone={setInVillage}
            />
          </Suspense>

          <Combat
            attackRef={attackRef}
            requestRef={attackRequest}
            cooldownRef={attackCooldown}
            playerPos={playerPos}
            playerYaw={playerYaw}
            monsters={monsterApi}
            level={level}
            owned={owned}
            onKill={onKill}
          />
        </Suspense>
      </Canvas>
      <WorldLoading />

      {hurtPulse > 0 && (
        <div
          key={hurtPulse}
          aria-hidden="true"
          className="world-damage-frame pointer-events-none fixed inset-0 z-40 animate-hurt-flash"
        />
      )}

      {/* ---- HUD ---- */}
      <div className="world-hud pointer-events-none fixed inset-0 z-40">
        <div className="world-tools pointer-events-auto absolute left-3 top-24 flex flex-col gap-2 sm:left-5">
          <div className="world-brand hud pixel-corner px-3 py-2 font-pixel text-[0.55rem] text-aqua">⌖ TOBIVERSE</div>
          <div className="hud px-3 py-2 font-mono text-xs text-ghost">{inVillage ? "Desa · aman" : "Hutan · area berburu"}</div>
          {festive && (
            <div className="hud pixel-corner animate-bob px-3 py-2 font-pixel text-[0.5rem] text-gold">
              🎉 {FESTIVAL_TITLE}
            </div>
          )}
          <div className="world-links flex flex-col gap-2">
            <Link href="/" className="hud pixel-corner px-3 py-2 font-pixel text-[0.5rem] text-ghost hover:text-hp">
              ◀ EXIT<span className="hidden sm:inline"> WORLD</span>
            </Link>
            <button
              onClick={() => setIntro(true)}
              className="hud pixel-corner px-3 py-2 text-left font-pixel text-[0.5rem] text-ghost hover:text-gold"
            >
              ? PETUNJUK
            </button>
          </div>
          <p className="hud hidden max-w-[13rem] rounded px-3 py-2 font-mono text-[0.66rem] leading-relaxed text-ghost sm:block">
            WASD / panah buat jalan, spasi buat menyerang, E buat ngobrol. Monster ada di luar desa. Di HP pakai analog di pojok kiri bawah. Portal ungu
            balik ke halaman portfolio.
          </p>
        </div>

        {prompt && (
          <div className="world-prompt absolute inset-x-0 bottom-[21rem] flex justify-center px-4 sm:bottom-40">
            <div className="hud pixel-corner animate-bob px-4 py-2.5 text-center font-pixel text-[0.55rem] text-gold">
              {prompt}
            </div>
          </div>
        )}

        {!intro && <RankBoard me={name} reloadKey={boardKey} />}

        {/* player card */}
        {!intro && (
          <div className="world-player-card hud pixel-corner absolute bottom-48 left-1/2 w-[17rem] -translate-x-1/2 p-2.5 sm:bottom-4 sm:w-80">
            <div className="mb-2 flex items-center gap-2">
              <span className="truncate font-pixel text-[0.55rem] text-white">{name || "PENGEMBARA"}</span>
              <span className="shrink-0 border-2 border-gold/50 px-1.5 py-0.5 font-pixel text-[0.45rem] text-gold">
                LV{level} <span className="hidden sm:inline">{rankFor(level)}</span>
              </span>
            </div>

            <div className="mb-1.5 flex items-center gap-2">
              <span className="w-6 shrink-0 font-pixel text-[0.45rem] text-hp">HP</span>
              <span className="stat-track flex-1">
                <span
                  className="stat-fill block text-hp transition-[width] duration-200"
                  style={{ width: `${(hp / PLAYER_MAX_HP) * 100}%` }}
                />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 shrink-0 font-pixel text-[0.45rem] text-xp">XP</span>
              <span className="stat-track flex-1">
                <span
                  className="stat-fill block text-xp transition-[width] duration-300"
                  style={{ width: `${levelProgress(xp) * 100}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right font-mono text-[0.6rem] tabular-nums text-ghost/60">
                {xp}
              </span>
            </div>

            <p className="mt-2 flex items-center gap-2 truncate font-mono text-[0.6rem] text-ghost/50">
              <span className="truncate">⚔ {weapon.name}</span>
              <span className="ml-auto shrink-0 text-gold">🪙 {gold}</span>
              <span className="shrink-0">{kills} buruan</span>
            </p>
          </div>
        )}

        {toast && (
          <div className="absolute inset-x-0 top-32 flex justify-center px-4">
            <div className="hud pixel-corner animate-bob px-4 py-2.5 text-center font-pixel text-[0.55rem] text-gold">
              {toast}
            </div>
          </div>
        )}

        {!talking && !intro && !boardOpen && (
          <>
            {/* positioning lives on the wrapper — Joystick keeps `relative` for its
                knob, and the two position classes would otherwise fight */}
            <div className="world-joystick-place pointer-events-auto absolute bottom-8 left-5 sm:bottom-10 sm:left-10">
              <Joystick vecRef={stick} />
            </div>

            <div className="world-actions absolute bottom-10 right-6 flex flex-col items-center gap-3 sm:bottom-14 sm:right-10">
              <button
                onClick={action}
                disabled={!nearId && !atPortal && !atBoard}
                className="btn-arcade pointer-events-auto h-14 w-14 rounded-full bg-aqua/20 text-aqua disabled:opacity-25"
              >
                {nearId ? "TALK" : atBoard ? "BACA" : atPortal ? "ENTER" : "TALK"}
              </button>
              <button
                onClick={attack}
                className="btn-arcade pointer-events-auto h-20 w-20 rounded-full bg-hp/25 text-hp"
              >
                SERANG
              </button>
            </div>
          </>
        )}
      </div>

      {talking && (
        <Dialogue
          npc={talking}
          index={line}
          topic={topic}
          onAdvance={advance}
          onClose={close}
          onPick={pickTopic}
          onBack={backToMenu}
          shop={{ level, gold, owned, equipped: weapon, onBuy: buy }}
          festive={festive}
        />
      )}

      {boardOpen && <BoardPanel onClose={() => setBoardOpen(false)} />}

      {intro && (
        <Intro
          initialName={name}
          initialClass={playerClass}
          claimedName={claimedName}
          onStart={startGame}
        />
      )}
    </div>
  );
}
