import { CURRENCIES, FALLBACK_RATES } from "@/lib/currency";

export const dynamic = "force-dynamic";

interface ErApiResponse {
  result?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
}

let cache: { rates: Record<string, number>; source: "live" | "fallback"; updatedAt: string; fetchedAt: number } | null = null;
const TTL_MS = 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
    return Response.json(cache, { headers: { "Cache-Control": "public, max-age=1800" } });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Rate provider responded ${res.status}`);
    const data = (await res.json()) as ErApiResponse;
    if (data.result !== "success" || !data.rates) throw new Error("Invalid rate payload");

    const rates: Record<string, number> = {};
    for (const currency of CURRENCIES) {
      const live = data.rates[currency.code];
      rates[currency.code] = typeof live === "number" && live > 0 ? live : FALLBACK_RATES[currency.code];
    }
    cache = { rates, source: "live", updatedAt: data.time_last_update_utc ?? new Date().toUTCString(), fetchedAt: Date.now() };
  } catch {
    cache = { rates: { ...FALLBACK_RATES }, source: "fallback", updatedAt: new Date().toUTCString(), fetchedAt: Date.now() - TTL_MS + 5 * 60 * 1000 };
  }

  return Response.json(cache, { headers: { "Cache-Control": "public, max-age=1800" } });
}
