import { kvGet, kvPut, getClientIp } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// reuse the existing data already stored in Cloudflare KV (legacy site)
const GB_KEY = "impressions";
const MAX_ENTRIES = 200;
const MAX_NAME = 40;
const MAX_MESSAGE = 280;

async function readEntries() {
  const raw = await kvGet(GB_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const entries = await readEntries();
  return Response.json({ entries });
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const ipKey = `impression_ip:${ip}`; // raw IP 

    // IP-based anti-spam: one message per IP (matches legacy behaviour)
    if (await kvGet(ipKey)) {
      return Response.json(
        { error: "Kamu sudah pernah ninggalin pesan 🙏 Makasih ya!" },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Body tidak valid" }, { status: 400 });
    }

    let name = String(body?.name ?? "").trim();
    let message = String(body?.message ?? "").trim();

    if (!message) {
      return Response.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    name = name ? name.slice(0, MAX_NAME) : "Anonymous";
    message = message.slice(0, MAX_MESSAGE);

    const entry = { name, message, createdAt: new Date().toISOString() };

    const entries = await readEntries();
    entries.unshift(entry); // newest first
    await kvPut(GB_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    await kvPut(ipKey, "1"); // permanent 

    return Response.json({ entry }, { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}
