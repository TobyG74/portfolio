import { kvGet, kvPut, getClientIp } from "@/lib/kv";
import { levelFor, rankFor } from "@/lib/game";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RANK_KEY = "world:rank";
const MAX_ENTRIES = 100;
const MAX_NAME = 18;
// a player cannot plausibly out-earn this, so anything above it is a forged post
const MAX_XP = 500000;

/**
 * One character per connection, enforced the same way the visitor counter
 * counts people: by client IP. Two keys, kept in step, so the rule reads the
 * same from either side.
 *
 *   world:ip:<ip>        which name this connection created
 *   world:owner:<name>   which connection owns that name
 *
 * IP is a weak identity. Shared wifi puts a household on one address and
 * mobile carriers hand out new ones, so this discourages a second character
 * rather than making one impossible. It is the same trade the guestbook makes.
 */
const ipKey = (ip) => `world:ip:${ip}`;
const ownerKey = (name) => `world:owner:${name.toLowerCase()}`;

async function readBoard() {
  const raw = await kvGet(RANK_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function decorate(list) {
  return list
    .slice()
    .sort((a, b) => b.xp - a.xp)
    .slice(0, MAX_ENTRIES)
    .map((p, i) => ({
      ...p,
      position: i + 1,
      level: levelFor(p.xp),
      rank: rankFor(levelFor(p.xp)),
    }));
}

export async function GET(request) {
  const ip = getClientIp(request);
  // `you` lets the client restore a character after a cache clear, and stops
  // the intro offering a fresh one to someone who already has it
  const claimed = ip ? await kvGet(ipKey(ip)) : null;
  return Response.json({ players: decorate(await readBoard()), you: claimed || null });
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Body tidak valid" }, { status: 400 });
    }

    const name = String(body?.name ?? "").trim().slice(0, MAX_NAME);
    const xp = Math.floor(Number(body?.xp));
    const kills = Math.floor(Number(body?.kills)) || 0;

    if (!name) return Response.json({ error: "Nama wajib diisi" }, { status: 400 });
    if (!Number.isFinite(xp) || xp < 0 || xp > MAX_XP) {
      return Response.json({ error: "Nilai XP tidak masuk akal" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const key = name.toLowerCase();

    if (ip) {
      const claimed = await kvGet(ipKey(ip));
      if (claimed && claimed.toLowerCase() !== key) {
        return Response.json(
          {
            error: `Perangkat ini sudah punya karakter bernama ${claimed}.`,
            you: claimed,
          },
          { status: 409 }
        );
      }

      const owner = await kvGet(ownerKey(name));
      if (owner && owner !== ip) {
        return Response.json(
          { error: "Nama itu sudah dipakai pemain lain. Pilih nama lain.", you: null },
          { status: 409 }
        );
      }

      if (!claimed) await kvPut(ipKey(ip), name);
      if (!owner) await kvPut(ownerKey(name), ip);
    }

    const board = await readBoard();
    const existing = board.find((p) => p.name.toLowerCase() === key);

    if (existing) {
      // scores only ever go up: a stale tab must not roll a player back
      if (xp > existing.xp) {
        existing.xp = xp;
        existing.kills = Math.max(existing.kills || 0, kills);
        existing.ts = Date.now();
      }
    } else {
      board.push({ name, xp, kills, ts: Date.now() });
    }

    const trimmed = board.sort((a, b) => b.xp - a.xp).slice(0, MAX_ENTRIES);
    await kvPut(RANK_KEY, JSON.stringify(trimmed));

    return Response.json({ players: decorate(trimmed), you: name }, { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}
