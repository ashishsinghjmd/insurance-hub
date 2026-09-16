import type { PayeeFormData } from "@/lib/forms/constants/payeeFormConstants";
import { COUNTRY_NAME_MAP } from "@/lib/data/countries";
import { US_STATE_NAME_TO_CODE } from "@/lib/data/usStates";

const COUNTRY_CODE: Record<string, string> = { "United States": "US", Canada: "CA", Mexico: "MX", "United Kingdom": "GB", Australia: "AU" };

export interface InvitePayload {
  firstName: string;
  lastName: string;
  middleName: string;
  surName: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  docId: string;
  docType: string;
  addressLine1: string;
  aptSuite: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isInternational: boolean;
  intDocId?: string;
  intDocType?: string;
  agreeTerms: boolean;
  subscribeToEmails: boolean;
  isReceiveSms: boolean;
}

export function toInvitePayload(form: PayeeFormData): InvitePayload {
  const countryCode = (COUNTRY_CODE[form.country] ?? form.country) ?? "US";
  const isUS = countryCode === "US";
  return {
    firstName: form.legalFirstName.trim(),
    lastName: form.legalLastName.trim(),
    middleName: form.middleName?.trim() ?? "",
    surName: form.secondSurname?.trim() ?? "",
    email: form.email.trim(),
    dateOfBirth: form.dateOfBirth,
    phone: form.phone?.replace(/\D/g, "") ?? "",
    docId: isUS ? ((form.documentId?.replace(/\D/g, "") ?? "") || "123456789") : "",
    docType: "SSN",
    intDocId: !isUS ? (form.intDocId?.trim() ?? "") : undefined,
    intDocType: !isUS ? (form.intDocType?.trim() ?? "") : undefined,
    addressLine1: form.address.trim(),
    aptSuite: form.aptSuite?.trim() ?? "",
    city: form.city.trim(),
    state: isUS ? (US_STATE_NAME_TO_CODE[form.state ?? ""] ?? form.state ?? "") : (form.state ?? ""),
    zip: form.zipCode.trim(),
    country: countryCode,
    isInternational: !isUS,
    agreeTerms: form.terms1,
    subscribeToEmails: true,
    isReceiveSms: false,
  };
}

export function normalizeCountryFromCode(code: string): string {
  return COUNTRY_NAME_MAP[code] ?? code;
}

export function getApiErrorMessage(raw: string, fallback = "Request failed"): string {
  if (!raw) return fallback;
  const trimmed = String(raw).trim();
  if (!trimmed) return fallback;
  try {
    const j = JSON.parse(trimmed);
    if (typeof j === "string" && j.trim()) return j.trim();
    if (j && typeof j === "object") {
      const o = j as Record<string, unknown>;
      const cand = o.message ?? o.msg ?? o.detail ?? o.error ?? o.errors;
      if (typeof cand === "string" && cand.trim()) return cand.trim();
      if (o.data && typeof o.data === "object") {
        const dm = (o.data as Record<string, unknown>).message ?? (o.data as Record<string, unknown>).msg;
        if (typeof dm === "string" && dm.trim()) return dm.trim();
      }
    }
  } catch {}
  return trimmed;
}

export function extractRpidFromResponse(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const data = (o.data as Record<string, unknown> | undefined) ?? o;
  const v = data.rpid ?? data.payeeId ?? o.rpid;
  return v != null ? String(v) : null;
}
