import { getDialCode } from "@/lib/data/countries";

export const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", CA: "🇨🇦", MX: "🇲🇽", GB: "🇬🇧", AU: "🇦🇺", AF: "🇦🇫",
  AL: "🇦🇱", DZ: "🇩🇿", IN: "🇮🇳", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵",
  BR: "🇧🇷", CN: "🇨🇳", RU: "🇷🇺", IT: "🇮🇹", ES: "🇪🇸",
};

function flagFromCode(code: string): string {
  return code.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function getCountryFlag(code: string): string {
  return COUNTRY_FLAGS[code] ?? (code.length === 2 ? flagFromCode(code) : "🌐");
}

export function formatPhoneForDisplay(digits: string, country: string): string {
  const d = digits.replace(/\D/g, "");
  if (!d) return "";
  if (country === "US" || country === "CA") {
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  }
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function getPhonePlaceholder(country: string): string {
  if (country === "US" || country === "CA") return "(XXX) XXX-XXXX";
  const dial = getDialCode(country) ?? "";
  return dial ? `Enter phone number (without ${dial})` : "Enter phone number";
}

export function stripPhoneFormatting(value: string): string {
  return value.replace(/\D/g, "");
}
