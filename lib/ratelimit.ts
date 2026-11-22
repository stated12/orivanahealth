import { headers } from "next/headers";
import { db } from "./db";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
/** True when allowed. Fails open if the limiter itself is unavailable. */
export async function allow(name: string, max: number, windowSeconds: number, extra = ""): Promise<boolean> {
  try {
    const ip = await clientIp();
    const { data, error } = await db().rpc("rate_hit", { p_key: `${name}:${ip}:${extra}`, p_window: windowSeconds, p_max: max });
    if (error) return true;
    return data !== false;
  } catch { return true; }
}
