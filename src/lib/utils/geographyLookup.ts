import * as zipcodeLib from "zipcode-detail-lookup";

interface ZipcodeResult { city: string; state: string; }

const cache = new Map<string, ZipcodeResult | null>();

export function lookupByZipCode(zipCode: string): ZipcodeResult | null {
  const clean = zipCode.replace(/\D/g, "").slice(0, 5);
  if (clean.length < 5) return null;
  if (cache.has(clean)) return cache.get(clean) ?? null;
  try {
    const r = (zipcodeLib as unknown as { lookupZip: (z: string) => { city: string; stateAbbreviation: string } | null }).lookupZip(clean);
    if (r) {
      const res = { city: r.city, state: r.stateAbbreviation };
      cache.set(clean, res);
      return res;
    }
    cache.set(clean, null);
    return null;
  } catch {
    cache.set(clean, null);
    return null;
  }
}
