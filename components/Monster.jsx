"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html, useAnimations, useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { angleTo, makeFlasher, normalize } from "@/lib/autorig";
import { VILLAGE_RADIUS } from "@/lib/game";
import { play as pacing } from "@/lib/config";

/**
 * Unlike the character and animal packs, MonstersPack_Ps1 IS rigged and DOES
 * ship clips (Idle, Atack, GetDamage, Death, plus Walk/Run/Flying), so these
 * play real animation instead of the procedural gait. Clip names are prefixed
 * with the armature name and the pack spells it "Atack", hence loose matching.
 */
function pickClip(clips, ...patterns) {
  for (const p of patterns) {
    const hit = clips.find((c) => p.test(c.name));
    if (hit) return hit.name;
  }
  return clips[0]?.name ?? null;
}

const AGGRO = 9;
const STRIKE = 1.7;
const ATTACK_COOLDOWN = 1.4;
const HURT_TIME = 0.35; // seconds of red tint and hurt animation per hit
const LEASH_AFTER = pacing.monsterLeash;
const HOME_REACHED = 0.4;
const GIVE_UP = pacing.monsterGiveUp;
const SNAP_HOME = 4; // seconds stuck on the way home before it is placed there

export default function Monster({ spec, spawn, playerPos, onHitPlayer, register, blockers, frozen }) {
  const fbx = useFBX(`/models/monsters/${spec.model}.fbx`);

  // SkeletonUtils.clone, not Object3D.clone: a plain clone shares the skeleton
  // and every copy on screen would animate as one
  const model = useMemo(() => normalize(cloneSkinned(fbx), spec.h), [fbx, spec.h]);
  const flash = useMemo(() => makeFlasher(model), [model]);
  const { actions, mixer } = useAnimations(fbx.animations, model);

  const clips = useMemo(
    () => ({
      idle: pickClip(fbx.animations, /idle/i),
      move: pickClip(fbx.animations, /fly/i, /run/i, /walk/i, /idle/i),
      attack: pickClip(fbx.animations, /at+ack/i, /\|DamageSpider$/i, /idle/i),
      hurt: pickClip(fbx.animations, /getdamage/i, /damage/i, /idle/i),
      death: pickClip(fbx.animations, /death/i, /idle/i),
    }),
    [fbx]
  );

  const root = useRef();
  const hp = useRef(spec.hp);
  const dead = useRef(false);
  const deadAt = useRef(null);
  const cooldown = useRef(0);
  const hurt = useRef(0);
  const hurtStarted = useRef(false);
  const attackTime = useRef(0);
  const attackLanded = useRef(false);
  const active = useRef(null); // name of the clip currently playing
  const calm = useRef(0); // seconds without a player in aggro range
  const leashing = useRef(false); // walking back to its spawn point
  const stuck = useRef(0); // seconds spent failing to close the distance
  const [bar, setBar] = useState(1); // only re-renders when damage lands

  const play = (name, { once = false, fade = 0.18, fit = 0, restart = false } = {}) => {
    if (!name || !actions[name] || (active.current === name && !restart)) return;
    const next = actions[name];
    const prev = active.current ? actions[active.current] : null;
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
    next.clampWhenFinished = once;
    // `fit` stretches a clip to fill a window, so one full attack animation
    // plays per swing instead of a 0.4s clip looping four times between blows
    next.timeScale = fit ? next.getClip().duration / fit : 1;
    next.fadeIn(fade).play();
    if (prev && prev !== next) prev.fadeOut(fade);
    active.current = name;
  };

  // hand a damage entry point back to the world
  useEffect(() => {
    const api = {
      uid: spec.uid,
      position: () => root.current?.position ?? null,
      isDead: () => dead.current,
      diedAt: () => deadAt.current,
      hit(amount) {
        if (dead.current) return 0;
        hp.current -= amount;
        hurt.current = HURT_TIME;
        hurtStarted.current = false;
        attackTime.current = 0;
        calm.current = 0; // being struck drags it back into the fight
        leashing.current = false;
        setBar(Math.max(0, hp.current / spec.hp));
        if (hp.current <= 0) {
          dead.current = true;
          deadAt.current = Date.now();
          // the reward is paid once, on the killing blow
          return { xp: spec.xp, gold: spec.gold, level: spec.level };
        }
        return null;
      },
    };
    return register(api);
  }, [register, spec.uid, spec.xp, spec.gold, spec.level, spec.hp]);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const g = root.current;
    if (!g) return;
    mixer.timeScale = frozen?.current ? 0 : 1;
    if (frozen?.current) return;

    if (dead.current) {
      flash(0);
      play(clips.death, { once: true });
      return;
    }

    if (hurt.current > 0) {
      hurt.current -= dt;
      flash(Math.max(0, Math.min(1, hurt.current / HURT_TIME)));
      play(clips.hurt, { once: true, fade: 0.08, fit: HURT_TIME, restart: !hurtStarted.current });
      hurtStarted.current = true;
    } else {
      flash(0);
    }
    cooldown.current = Math.max(0, cooldown.current - dt);

    // Always push out of buildings, not only while chasing. A monster that
    // spawned or got shoved inside a wall used to stand there for good.
    {
      const [fx, fz] = blockers.resolve(g.position.x, g.position.z, 0.4);
      g.position.x = fx;
      g.position.z = fz;
    }

    const p = playerPos.current;
    const dx = p.x - g.position.x;
    const dz = p.z - g.position.z;
    const dist = Math.hypot(dx, dz) || 1e-6;
    const playerSafe = Math.hypot(p.x, p.z) < VILLAGE_RADIUS;

    // Leashing: ignore it for a few seconds and it gives up, walks back to
    // where it spawned and heals. Without this a single chase would drag every
    // monster on the map into the village edge and leave them there.
    calm.current = !playerSafe && dist < AGGRO && !leashing.current ? 0 : calm.current + dt;
    if (calm.current >= LEASH_AFTER && !leashing.current) {
      const strayed = Math.hypot(g.position.x - spawn[0], g.position.z - spawn[1]);
      if (strayed > HOME_REACHED) {
        leashing.current = true;
        attackTime.current = 0;
        stuck.current = 0;
      } else if (hp.current < spec.hp) {
        hp.current = spec.hp; // already home, just recover
        setBar(1);
      }
    }

    if (leashing.current) {
      const hx = spawn[0] - g.position.x;
      const hz = spawn[1] - g.position.z;
      const home = Math.hypot(hx, hz);

      const jammed = stuck.current > SNAP_HOME;
      if (home <= HOME_REACHED || jammed) {
        if (jammed) {
          g.position.x = spawn[0];
          g.position.z = spawn[1];
        }
        leashing.current = false;
        stuck.current = 0;
        calm.current = 0;
        hp.current = spec.hp; // back on its patch, wounds forgotten
        setBar(1);
        play(clips.idle);
      } else {
        const step = Math.min(home, Math.max(spec.speed, 2) * dt);
        const [rx, rz] = blockers.resolve(
          g.position.x + (hx / home) * step,
          g.position.z + (hz / home) * step,
          0.4
        );
        const progress = home - Math.hypot(spawn[0] - rx, spawn[1] - rz);
        stuck.current = progress < step * 0.1 ? stuck.current + dt : 0;
        g.position.x = rx;
        g.position.z = rz;
        g.rotation.y += angleTo(g.rotation.y, Math.atan2(hx, hz)) * (1 - Math.exp(-10 * dt));
        if (hurt.current <= 0) play(progress > 0 ? clips.move : clips.idle);
      }

      if (spec.fly) {
        g.position.y = spec.fly + Math.sin(state.clock.elapsedTime * 2.4 + spec.uid) * 0.22;
      }
      return; // deaf to the player until it is home again
    }

    if ((dist <= STRIKE || attackTime.current > 0) && !playerSafe && hurt.current <= 0) {
      g.rotation.y += angleTo(g.rotation.y, Math.atan2(dx, dz)) * (1 - Math.exp(-12 * dt));
      if (cooldown.current === 0 && attackTime.current === 0) {
        cooldown.current = ATTACK_COOLDOWN;
        attackTime.current = ATTACK_COOLDOWN;
        attackLanded.current = false;
        play(clips.attack, { once: true, fade: 0.1, fit: ATTACK_COOLDOWN * 0.8, restart: true });
      }
      if (attackTime.current > 0) {
        attackTime.current = Math.max(0, attackTime.current - dt);
        if (!attackLanded.current && attackTime.current <= ATTACK_COOLDOWN * 0.55) {
          attackLanded.current = true;
          calm.current = 0;
          if (dist <= STRIKE + 0.35) onHitPlayer(spec.damage);
        }
      }
      if (attackTime.current < ATTACK_COOLDOWN * 0.2) play(clips.idle);
    } else if (dist < AGGRO && spec.speed > 0 && !playerSafe && hurt.current <= 0) {
      attackTime.current = 0;
      const step = Math.min(dist - STRIKE * 0.85, spec.speed * dt);
      let [nx, nz] = blockers.resolve(
        g.position.x + (dx / dist) * step,
        g.position.z + (dz / dist) * step,
        0.4
      );

      // the village is holy ground: a chase stops dead at its edge, so the
      // player always has somewhere safe to stand
      const fromCentre = Math.hypot(nx, nz);
      if (fromCentre < VILLAGE_RADIUS) {
        const k = VILLAGE_RADIUS / (fromCentre || 1e-6);
        nx *= k;
        nz *= k;
      }

      const progress = ((nx - g.position.x) * dx + (nz - g.position.z) * dz) / dist;
      g.position.x = nx;
      g.position.z = nz;
      g.rotation.y += angleTo(g.rotation.y, Math.atan2(dx, dz)) * (1 - Math.exp(-10 * dt));
      if (hurt.current <= 0) play(progress > 0 ? clips.move : clips.idle);

      // a player standing behind a wall is unreachable; stop shoving the wall
      // and head home instead of grinding there until the leash timer fires
      stuck.current = progress < step * 0.1 ? stuck.current + dt : 0;

      if (stuck.current > GIVE_UP) {
        leashing.current = true;
        stuck.current = 0;
        attackTime.current = 0;
      }
    } else if (hurt.current <= 0) {
      attackTime.current = 0;
      play(clips.idle);
      stuck.current = 0;
    }

    if (spec.fly) {
      g.position.y = spec.fly + Math.sin(state.clock.elapsedTime * 2.4 + spec.uid) * 0.22;
    }
  });

  useEffect(() => {
    play(clips.idle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  return (
    <group ref={root} position={[spawn[0], spec.fly || 0, spawn[1]]}>
      <primitive object={model} />
      {bar > 0 && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025 - (spec.fly || 0), 0]}>
        <circleGeometry args={[spec.h * 0.7, 20]} />
        <meshBasicMaterial color="#243421" transparent opacity={0.22} depthWrite={false} />
      </mesh>}
      {bar > 0 && (
        <Html
          center
          position={[0, spec.h + 0.6, 0]}
          distanceFactor={10}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="world-label bg-void px-2 py-1 font-pixel text-xs text-gold">
              {spec.model.toUpperCase()} · LV{spec.level}
            </span>
            {bar < 1 && (
              <div className="stat-track w-16">
                <div className="h-full bg-hp" style={{ width: `${bar * 100}%` }} />
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
