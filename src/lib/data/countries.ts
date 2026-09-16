import { getData as getCountryListData } from "country-list";
import intlTelCountries from "intl-tel-input/data";

export interface Country { code: string; name: string; dialCode?: string; }

const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", KR: "South Korea", KP: "North Korea",
  TW: "Taiwan", TZ: "Tanzania", MD: "Moldova", IR: "Iran", SY: "Syria", LA: "Laos",
  VN: "Vietnam", RU: "Russia", BO: "Bolivia", VE: "Venezuela", MK: "North Macedonia",
  CG: "Congo", CD: "DR Congo", FM: "Micronesia", PS: "Palestine",
};

function buildDialCodeMaps(): { codes: Record<string, string>; priority: Record<string, number> } {
  const codes: Record<string, string> = {};
  const priority: Record<string, number> = {};
  const sorted = [...intlTelCountries].sort((a, b) => a.priority - b.priority);
  for (const c of sorted) {
    const code = c.iso2.toUpperCase();
    priority[code] = c.priority;
    if (!codes[code]) codes[code] = "+" + c.dialCode;
  }
  return { codes, priority };
}

const { codes: COUNTRY_DIAL_CODES_MAP, priority: COUNTRY_DIAL_CODE_PRIORITY_MAP } = buildDialCodeMaps();

export const COUNTRY_DIAL_CODES: Record<string, string> = COUNTRY_DIAL_CODES_MAP;
export const COUNTRY_DIAL_CODE_PRIORITY: Record<string, number> = COUNTRY_DIAL_CODE_PRIORITY_MAP;

export const COUNTRIES: Country[] = (getCountryListData() as { code: string; name: string }[]).map(({ code, name }) => ({
  code,
  name: DISPLAY_NAME_OVERRIDES[code] ?? name,
  dialCode: COUNTRY_DIAL_CODES_MAP[code],
}));

export const COUNTRY_CODE_MAP: Record<string, string> = Object.fromEntries(COUNTRIES.map((c) => [c.name, c.code]));
export const COUNTRY_NAME_MAP: Record<string, string> = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));
export const COUNTRY_OPTIONS = [
  { label: "United States", value: "US" },
  ...COUNTRIES.filter((c) => c.code !== "US").sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ label: c.name, value: c.code })),
];

export const getCountryByCode = (code: string) => COUNTRIES.find((c) => c.code === code);
export const getCountryByName = (name: string) => COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
export const getDialCode = (code: string) => COUNTRY_DIAL_CODES[code];
export const normalizeCountryCode = (country: string | undefined): string => {
  if (!country) return "";
  if (country.length === 2) return getCountryByCode(country.toUpperCase()) ? country.toUpperCase() : "";
  return getCountryByName(country)?.code ?? "";
};
export const getCountriesSortedByName = () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
export const getSupportedCountries = (codes: string[]) => COUNTRIES.filter((c) => codes.includes(c.code));
export const formatPhoneWithDialCode = (phone: string, code: string): string => {
  const dial = COUNTRY_DIAL_CODES[code];
  if (!dial) return phone;
  const esc = dial.replace("+", "\\+");
  return `${dial} ${phone.replace(new RegExp(`^${esc}\\s*`), "").replace(/^0/, "")}`;
};
