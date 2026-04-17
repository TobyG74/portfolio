import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

const COUNTER_KEY = process.env.VISITOR_COUNTER_KEY || "site_visitors";

async function getKv() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.KV ?? null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const action = new URL(request.url).searchParams.get("action");
  const kv = await getKv();

  if (!kv) {
    return NextResponse.json(
      { value: 0, persisted: false, source: "fallback", warning: "KV binding not available" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const raw = await kv.get(COUNTER_KEY);
    const current = raw !== null ? Math.max(0, parseInt(raw, 10) || 0) : 0;

    if (action === "hit") {
      const next = current + 1;
      await kv.put(COUNTER_KEY, String(next));
      return NextResponse.json(
        { value: next, persisted: true, source: "cloudflare-kv" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { value: current, persisted: true, source: "cloudflare-kv" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      { value: 0, persisted: false, source: "fallback", warning: String(err) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}