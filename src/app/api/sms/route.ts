import { NextResponse } from "next/server";

const AAKASH_SMS_ENDPOINT = "https://sms.aakashsms.com/sms/v3/send";

/**
 * Relay Aakash SMS requests through Vercel.
 *
 * PythonAnywhere's free tier only allows outbound requests to allowlisted
 * domains, and sms.aakashsms.com is not on that list. The deployed frontend
 * has unrestricted outbound access, so the Django backend can fall back to
 * this route when its direct request is blocked by the proxy.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: true, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const authToken =
    typeof payload.auth_token === "string" ? payload.auth_token.trim() : "";
  const to = typeof payload.to === "string" ? payload.to.trim() : "";
  const text = typeof payload.text === "string" ? payload.text.trim() : "";

  if (!authToken || !to || !text) {
    return NextResponse.json(
      { error: true, message: "auth_token, to and text are required." },
      { status: 400 }
    );
  }

  if (to.length > 1000 || text.length > 1000) {
    return NextResponse.json(
      { error: true, message: "SMS payload is too large." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(AAKASH_SMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ auth_token: authToken, to, text }),
      cache: "no-store",
    });

    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Could not reach Aakash SMS." },
      { status: 502 }
    );
  }
}
