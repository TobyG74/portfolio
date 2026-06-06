import { kvGet, kvPut, getClientIp, hashIp } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COUNTER_KEY = process.env.VISITOR_COUNTER_KEY || "site_visitors";
const DEDUPE_TTL = 60 * 60 * 12; // count an IP at most once per 12h

export async function GET(request) {
  try {
    const ip = getClientIp(request);
    const ipKey = `visitor_ip:${hashIp(ip)}`;

    let count = parseInt((await kvGet(COUNTER_KEY)) || "0", 10) || 0;
    const seen = await kvGet(ipKey);

    if (!seen) {
      count += 1;
      await kvPut(COUNTER_KEY, String(count));
      await kvPut(ipKey, "1", { ttl: DEDUPE_TTL });
    }

    return Response.json({ count, counted: !seen });
  } catch (err) {
    // never break the UI over the counter
    return Response.json({ count: null, error: String(err.message || err) }, { status: 200 });
  }
}
