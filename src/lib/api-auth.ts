import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Reusable API authentication guard.
 * Returns the session if authenticated, or a 401 JSON response if not.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

/**
 * Require a specific role for API access.
 * Defaults to checking for non-guest users.
 */
export async function requireRole(allowedRoles: string[] = ["user", "admin"]) {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  const userRole = (session.user as any).role || "user";
  if (!allowedRoles.includes(userRole)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}
