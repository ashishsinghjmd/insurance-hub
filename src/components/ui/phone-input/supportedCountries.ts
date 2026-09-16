/**
 * Country-code support guard for `intl-tel-input`.
 *
 * The app's country dropdowns are built from `country-list` (249 ISO 3166-1
 * countries), but `intl-tel-input` only ships data for ~244. The difference
 * (e.g. PN/Pitcairn, AQ/Antarctica) is selectable in the UI yet unsupported by
 * the phone widget. Passing an unsupported code to the library's public
 * `setCountry()` throws `Invalid country code: '<code>'`, which previously
 * crashed the Edit Details form.
 *
 * These helpers let `PhoneInput` validate a code before handing it to the
 * library and fall back to a supported default instead of throwing.
 *
 * @module components/ui/phone-input/supportedCountries
 */

import intlTelCountries from "intl-tel-input/data";

/** Default fallback country used when an unsupported code is supplied. */
export const DEFAULT_COUNTRY = "us";

/**
 * Lowercased ISO2 codes that `intl-tel-input` recognises. Built once at module
 * load from the library's own data so it stays in sync with the installed version.
 */
const SUPPORTED_ISO2: ReadonlySet<string> = new Set(
  intlTelCountries.map((country) => country.iso2.toLowerCase()),
);

/**
 * Whether `intl-tel-input` supports the given ISO 3166-1 alpha-2 country code.
 * Case-insensitive; trims surrounding whitespace. Empty/nullish → false.
 */
export function isSupportedCountry(iso2: string | undefined | null): boolean {
  if (!iso2) return false;
  return SUPPORTED_ISO2.has(iso2.trim().toLowerCase());
}

/**
 * Return the lowercased code if `intl-tel-input` supports it, otherwise the
 * fallback. Guarantees a value safe to pass to the library's `setCountry()`.
 */
export function resolveSupportedCountry(
  iso2: string | undefined | null,
  fallback: string = DEFAULT_COUNTRY,
): string {
  const normalized = iso2?.trim().toLowerCase() ?? "";
  return SUPPORTED_ISO2.has(normalized) ? normalized : fallback;
}
