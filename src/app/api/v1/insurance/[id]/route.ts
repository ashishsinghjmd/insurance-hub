import { NextRequest, NextResponse } from "next/server";

const JUICE_API_URL =
  process.env.JUICE_API_URL ||
  process.env.JUICE_PRO_API_URL ||
  process.env.NEXT_PUBLIC_JUICE_API_URL ||
  "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { status: "error", code: 400, message: "Missing id" },
        { status: 400 }
      );
    }
    const target = `${JUICE_API_URL.replace(/\/$/, "")}/api/v1/insurance/${encodeURIComponent(id)}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const cookie = request.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;
    const authorization = request.headers.get("authorization");
    if (authorization) headers["authorization"] = authorization;

    const upstream = await fetch(target, {
      method: "GET",
      headers,
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
        message: error instanceof Error ? error.message : "Failed to proxy insurance get to Juice",
      },
      { status: 500 }
    );
  }
}
