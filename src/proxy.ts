import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT = 50;
const WINDOW_MS = 60 * 1000;

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/chat") ||
    request.nextUrl.pathname.startsWith("/api/embed") ||
    request.nextUrl.pathname.startsWith("/api/search")
  ) {
    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();

    const record = rateLimitMap.get(ip);

    if (!record) {
      rateLimitMap.set(ip, {
        count: 1,
        timestamp: now,
      });
    } else {
      if (now - record.timestamp > WINDOW_MS) {
        rateLimitMap.set(ip, {
          count: 1,
          timestamp: now,
        });
      } else {
        record.count += 1;

        if (record.count > RATE_LIMIT) {
          return new NextResponse(
            JSON.stringify({
              error: "Too many requests. Please try again later.",
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/chat", "/api/embed", "/api/search"],
};