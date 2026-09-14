/**
 * GET /api/v1/insurance/cardholder
 *
 * Proxies to juice-pro's real cardholder report API
 * (`GET /api/v1/reports/cardholders`) and normalizes the raw Praxell rows
 * into a simple payee list `{ id, name, email, phone, status }` consumed by
 * the Make Payment / New Payee payee-select dropdowns.
 *
 * Auth: requires an insurance-hub Auth0 session; the same session cookie is
 * forwarded to juice-pro (both apps share AUTH0_SECRET, so juice-pro can
 * decrypt it) so the upstream call is authenticated as the current user.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

const JUICE_PRO_API_URL = process.env.JUICE_PRO_API_URL || "http://localhost:3000";
const CARDHOLDERS_PATH = "/api/v1/reports/cardholders";

type RawCardholder = {
  rpid_?: string | number;
  rpid?: string | number;
  id?: string | number;
  payeeId?: string | number;
  full_name?: string;
  fullName?: string;
  payeeName?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile_phone?: string | number;
  phone?: string | number;
  mobilePhone?: string | number;
  card_status?: string;
  cardStatus?: string;
  status?: string;
  address?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  dob?: string;
};

type Payee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  address?: string;
  cardStatus?: string;
  dateOfBirth?: string;
};

function toPayee(ch: RawCardholder): Payee | null {
  const rawId = ch.rpid_ ?? ch.rpid ?? ch.id ?? ch.payeeId;
  const id = rawId !== undefined && rawId !== null ? String(rawId).trim() : "";
  if (!id) return null;
  const name =
    (ch.payeeName && String(ch.payeeName).trim()) ||
    (ch.full_name && String(ch.full_name).trim()) ||
    (ch.fullName && String(ch.fullName).trim()) ||
    (ch.name && String(ch.name).trim()) ||
    [ch.first_name ?? ch.firstName, ch.last_name ?? ch.lastName].filter(Boolean).join(" ").trim() ||
    "Unknown";
  // avoid Unknown if name is still empty but we have id
  const displayName = name && name !== "Unknown" ? name : id !== "Unknown" ? `Payee ${id}` : "Unknown";
  return {
    id,
    name: displayName,
    email: String(ch.email ?? ""),
    phone: String(ch.mobile_phone ?? ch.mobilePhone ?? ch.phone ?? ""),
    status: String(ch.card_status ?? ch.cardStatus ?? ch.status ?? "ACT"),
    address: ch.address ? String(ch.address) : undefined,
    cardStatus: String(ch.card_status ?? ch.cardStatus ?? ch.status ?? "ACT"),
    dateOfBirth: String(ch.dateOfBirth ?? ch.date_of_birth ?? ch.dob ?? "2008-01-16"),
  };
}

export async function GET(request: NextRequest) {
  // 1. Require an authenticated Auth0 session (same Auth0 tenant as juice-pro)
  const session = await auth0.getSession(request);
  if (!session?.user) {
    return NextResponse.json(
      { status: "error", code: 401, message: "Authentication required" },
      { status: 401 }
    );
  }

  // 2. Build the upstream query, defaulting to today's date + insurance hub payees
  const incoming = request.nextUrl.searchParams;
  const upstreamUrl = new URL(`${JUICE_PRO_API_URL}${CARDHOLDERS_PATH}`);
  upstreamUrl.searchParams.set("toDate", incoming.get("toDate") || new Date().toISOString().slice(0, 10));
  upstreamUrl.searchParams.set("view", incoming.get("view") || "payees");
  upstreamUrl.searchParams.set("cardStatus", incoming.get("cardStatus") || "ACT");
  upstreamUrl.searchParams.set("hubName", incoming.get("hubName") || "insurance");

  // 3. Forward the request to juice-pro, carrying the session cookie along so
  //    its own Auth0 middleware/apiAuth can authenticate this call.
  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    const body = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        body ?? { status: "error", code: upstream.status, message: "Failed to load cardholders" },
        { status: upstream.status }
      );
    }

    const rawCardholders: RawCardholder[] = Array.isArray(body?.data?.cardholders) ? body.data.cardholders : [];
    const payees = rawCardholders.map(toPayee).filter((p): p is Payee => p !== null);

    return NextResponse.json(
      { status: "success", code: 200, data: { totalCount: payees.length, payees } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "Failed to reach cardholder reporting service" },
      { status: 502 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ status: "error", code: 405, message: "Use GET" }, { status: 405 });
}

