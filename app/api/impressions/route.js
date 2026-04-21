import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

const IMPRESSIONS_KEY = "impressions";
const IP_PREFIX = "impression_ip:";
const MAX_NAME_LENGTH = 60;
const MAX_MSG_LENGTH = 500;

function normalizeImpressionsPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.entries)) return payload.entries;
  if (payload && Array.isArray(payload.messages)) return payload.messages;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function parseImpressions(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return normalizeImpressionsPayload(parsed);
  } catch {
    return [];
  }
}

async function getKv() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.KV ?? null;
  } catch {
    return null;
  }
}

function getClientIp(request) {
  const cfIp = request.headers.get("CF-Connecting-IP");
  if (cfIp) return cfIp;
  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function GET() {
  const kv = await getKv();
  if (!kv) {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const raw = await kv.get(IMPRESSIONS_KEY);
    const list = parseImpressions(raw);
    return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request) {
  const kv = await getKv();
  if (!kv) {
    return NextResponse.json(
      { error: "Service unavailable. Please try again later." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body?.name ?? "").toString().trim().slice(0, MAX_NAME_LENGTH);
  const message = (body?.message ?? "").toString().trim().slice(0, MAX_MSG_LENGTH);

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipKey = `${IP_PREFIX}${ip}`;

  try {
    const alreadySubmitted = await kv.get(ipKey);
    if (alreadySubmitted) {
      return NextResponse.json(
        { error: "You have already submitted an impression. Only one message per visitor is allowed." },
        { status: 429 }
      );
    }

    const raw = await kv.get(IMPRESSIONS_KEY);
    const list = parseImpressions(raw);

    const entry = {
      name: name || "Anonymous",
      message,
      createdAt: new Date().toISOString(),
    };

    list.unshift(entry);
    await Promise.all([
      kv.put(IMPRESSIONS_KEY, JSON.stringify(list)),
      kv.put(ipKey, "1"),
    ]);

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save impression. Please try again." },
      { status: 500 }
    );
  }
}
