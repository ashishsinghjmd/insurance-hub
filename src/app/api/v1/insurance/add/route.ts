import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

const JUICE_API_URL =
  process.env.JUICE_API_URL ||
  process.env.JUICE_PRO_API_URL ||
  process.env.NEXT_PUBLIC_JUICE_API_URL ||
  "http://localhost:3000";

const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * juice-pro protects all state-changing (POST/PUT/PATCH/DELETE) routes with
 * Redis-backed CSRF tokens (see juice-pro/lib/middleware/csrf.ts). A token
 * must first be minted via GET /api/csrf/token (bound to the caller's Auth0
 * session cookie) and then echoed back in the `X-CSRF-Token` header on the
 * actual request, otherwise juice-pro responds with
 * `MALFORMED_REQUEST: "Invalid request format - token required in header"`.
 */
async function fetchCsrfToken(cookie: string | null): Promise<string | null> {
  try {
    const res = await fetch(`${JUICE_API_URL.replace(/\/$/, "")}/api/csrf/token`, {
      method: "GET",
      headers: cookie ? { cookie } : {},
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    const token = body?.data?.csrfToken || body?.csrfToken;
    return typeof token === "string" ? token : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const target = `${JUICE_API_URL.replace(/\/$/, "")}/api/v1/insurance/add`;

    // Read body via clone BEFORE auth to avoid "disturbed or locked" (auth may read request)
    let rawBody = "";
    try {
      rawBody = await request.clone().text();
    } catch {
      rawBody = "";
    }

    // 1. Require Auth0 session - same as cardholder route
    const session = await auth0.getSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { status: "error", code: 401, message: "Authentication required" },
        { status: 401 }
      );
    }

    const cookie = request.headers.get("cookie");

    // 2. Mint a CSRF token bound to this session's cookie before calling juice-pro
    const csrfToken = await fetchCsrfToken(cookie);
    if (!csrfToken) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "CSRF_TOKEN_UNAVAILABLE", message: "Unable to obtain CSRF token from Juice API" },
          meta: { timestamp: new Date().toISOString(), requestId: `local-${Date.now()}` },
        },
        { status: 502 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      [CSRF_HEADER_NAME]: csrfToken,
    };
    if (cookie) headers["cookie"] = cookie;
    // Forward original authorization if present (harmless if juice-pro ignores it)
    const authorization = request.headers.get("authorization");
    if (authorization) headers["authorization"] = authorization;

    const upstream = await fetch(target, {
      method: "POST",
      headers,
      body: rawBody || undefined,
      cache: "no-store",




    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!upstream.ok) {
      if (data && typeof data === "object") {
        return NextResponse.json(data as object, { status: upstream.status });
      }
      return NextResponse.json(
        { status: "error", code: upstream.status, message: String(data || upstream.statusText) },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data as object, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: error instanceof Error ? error.message : "Failed to proxy insurance add to Juice",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "error", code: 405, message: "Use POST" }, { status: 405 });
}
