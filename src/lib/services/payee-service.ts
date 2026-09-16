import { juiceFetch } from "@/lib/api";
import { toInvitePayload, getApiErrorMessage, extractRpidFromResponse } from "@/lib/utils/payee-transformers";
import type { PayeeFormData } from "@/lib/forms/constants/payeeFormConstants";

export async function createPayee(form: PayeeFormData): Promise<string | null> {
  const payload = toInvitePayload(form);
  const res = await juiceFetch("/v1/insurance/invite", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(getApiErrorMessage(await res.text(), res.statusText || "Failed to create payee"));
  let rpid: string | null = null;
  try {
    const data = await res.clone().json();
    rpid = extractRpidFromResponse(data);
  } catch {}
  return rpid;
}

export { getApiErrorMessage };
