import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/tools", "/ai-assistant"];
const authPaths = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isProtected = protectedPaths.some((p) =>
    nextUrl.pathname.startsWith(p)
  );
  const isAuthPage = authPaths.some((p) => nextUrl.pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(
        `/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`,
        nextUrl
      )
    );
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|assets|resume).*)",
  ],
};
