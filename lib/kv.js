/**
 * Thin wrapper around the Cloudflare KV REST API.
 *
 * Configure via env (see .env.example):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_KV_NAMESPACE_ID
 *   CLOUDFLARE_API_TOKEN          (needs "Workers KV Storage:Edit")
 */

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const NAMESPACE = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const BASE =
  ACCOUNT && NAMESPACE
    ? `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${NAMESPACE}`
    : null;

export function kvConfigured() {
  return Boolean(BASE && TOKEN);
}

// dev / fallback store, persisted across hot reloads via globalThis
const mem = (globalThis.__MEM_KV__ ??= new Map());

export async function kvGet(key) {
  if (!kvConfigured()) return mem.has(key) ? mem.get(key) : null;

  const res = await fetch(`${BASE}/values/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV get failed (${res.status}) for ${key}`);
  return await res.text();
}

export async function kvPut(key, value, { ttl } = {}) {
  if (!kvConfigured()) {
    mem.set(key, value);
    return true;
  }

  const url = new URL(`${BASE}/values/${encodeURIComponent(key)}`);
  if (ttl) url.searchParams.set("expiration_ttl", String(ttl));

  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "text/plain" },
    body: value,
  });
  if (!res.ok) throw new Error(`KV put failed (${res.status}) for ${key}`);
  return true;
}

/** Best-effort client IP from common proxy headers (Cloudflare first). */
export function getClientIp(request) {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "0.0.0.0"
  );
}

/** Stable, privacy-friendly hash of an IP (djb2) */
export function hashIp(ip) {
  let h = 5381;
  for (let i = 0; i < ip.length; i++) h = ((h << 5) + h + ip.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
