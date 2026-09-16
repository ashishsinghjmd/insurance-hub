export const SUPPORTED_INT_DOC_TYPES = ["Passport", "National ID", "Driving License"] as const;
export type SupportedIntDocType = typeof SUPPORTED_INT_DOC_TYPES[number];
export const INT_DOC_TYPE_OPTIONS = SUPPORTED_INT_DOC_TYPES.map((t) => ({ label: t, value: t }));
export function canonicalizeIntDocType(raw: string): string {
  const trimmed = raw.trim();
  return SUPPORTED_INT_DOC_TYPES.find((t) => t.toLowerCase() === trimmed.toLowerCase()) ?? trimmed;
}
