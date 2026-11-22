import { cache } from "react";
import { db } from "./db";
export type Settings = Record<string, any>;
export const getSettings = cache(async (): Promise<Settings> => {
  try { const { data } = await db().from("site_settings").select("key,value"); const o: Settings = {}; for (const r of data || []) o[r.key] = r.value; return o; } catch { return {}; }
});
export const num = (v: any, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
export const bool = (v: any) => v === true || v === "true";
/** Picks a language value from {en:"..",hi:".."}; falls back to English then to a plain string. */
export function L(obj: any, lang = "en", fallback = ""): string {
  if (!obj) return fallback; if (typeof obj === "string") return obj;
  return (obj[lang] && String(obj[lang]).trim()) || obj.en || fallback;
}
export const LO = (obj: any, lang = "en"): any => (obj && ((obj[lang] && Object.keys(obj[lang]).length && obj[lang]) || obj.en)) || {};
