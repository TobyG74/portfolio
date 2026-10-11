"use client";

import { useEffect, useState } from "react";

const REFRESH_MS = 30000;

/**
 * Shared leaderboard. Reads /api/rank, which is backed by the same Cloudflare
 * KV namespace the guestbook uses, so every visitor sees the same table.
 */
const TOP_N = 10;

export default function RankBoard({ me, reloadKey }) {
  const [players, setPlayers] = useState([]);
  const [open, setOpen] = useState(() => !window.matchMedia("(max-width: 639px), (max-height: 500px)").matches);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/rank")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          setPlayers(Array.isArray(d.players) ? d.players : []);
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [reloadKey]);

  const mine = me ? players.findIndex((p) => p.name.toLowerCase() === me.toLowerCase()) : -1;
  const top = players.slice(0, TOP_N);
  // outside the top ten, the player's own row is pinned below the cut instead
  const pinned = mine >= TOP_N ? players[mine] : null;

  return (
    <div className="world-rank-board pointer-events-auto absolute right-3 top-24 w-52 sm:right-5 sm:w-60">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="world-rankings"
        onClick={() => setOpen((v) => !v)}
        className="hud pixel-corner flex w-full items-center justify-between px-3 py-2 font-pixel text-[0.5rem] text-gold"
      >
        <span>🏆 PERINGKAT <span className="hidden sm:inline">{TOP_N} BESAR</span></span>
        <span className="text-ghost/60">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div id="world-rankings" className="hud pixel-corner mt-2 max-h-[40dvh] overflow-y-auto p-2">
          {failed && <p className="p-1 font-mono text-[0.62rem] text-ghost/50">Papan tidak terbaca.</p>}
          {!failed && players.length === 0 && (
            <p className="p-1 font-mono text-[0.62rem] text-ghost/50">Belum ada pemburu tercatat.</p>
          )}

          {top.map((p) => (
            <Row key={p.name} p={p} me={me} />
          ))}
          {pinned && (
            <>
              <div className="my-1 border-t-2 border-white/10" />
              <Row p={pinned} me={me} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ p, me }) {
  const isMe = me && p.name.toLowerCase() === me.toLowerCase();
  const medal = p.position <= 3 ? ["🥇", "🥈", "🥉"][p.position - 1] : null;

  return (
    <div
      className={`flex items-center gap-2 px-1 py-1 font-mono text-[0.62rem] ${
        isMe ? "bg-primary text-text" : "text-ghost"
      }`}
    >
      <span className="w-5 shrink-0 text-center">{medal || p.position}</span>
      <span className="min-w-0 flex-1 truncate">{p.name}</span>
      <span className={`shrink-0 font-pixel text-xs ${isMe ? "text-text" : "text-aqua"}`}>LV{p.level}</span>
      <span className="w-10 shrink-0 text-right tabular-nums">{p.xp}</span>
    </div>
  );
}
