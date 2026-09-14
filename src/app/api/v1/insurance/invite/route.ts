import { NextRequest, NextResponse } from "next/server";

// Proxies to juice-pro (card-provisioning-service) instead of mock.
// Client should call juiceFetch("/v1/insurance/invite", { method: "POST", body: JSON.stringify(payload) })
// which hits /api/v1/insurance/invite locally and is forwarded here to the upstream Juice API.
const JUICE_API_URL =
  process.env.JUICE_API_URL || process.env.NEXT_PUBLIC_JUICE_API_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const target = `${JUICE_API_URL.replace(/\/$/, "")}/api/v1/insurance/invite`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const cookie = request.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;
    const authorization = request.headers.get("authorization");
    if (authorization) headers["authorization"] = authorization;

    const upstream = await fetch(target, {
      method: "POST",
      headers,
      body: rawBody || undefined,
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
        message: error instanceof Error ? error.message : "Failed to proxy invite to Juice",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "error", code: 405, message: "Use POST" }, { status: 405 });
}
