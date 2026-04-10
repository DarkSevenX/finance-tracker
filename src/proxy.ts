import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** En HTTPS (p. ej. Vercel) Auth.js emite `__Secure-authjs.session-token`; getToken debe usar el mismo nombre. */
function useSecureSessionCookie(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded === "https";
  return req.nextUrl.protocol === "https:";
}

/** Next.js 16+: sustituye a middleware.ts (ver docs middleware-to-proxy). */
export async function proxy(req: NextRequest) {
  const secureCookie = useSecureSessionCookie(req);
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie,
  });
  const loggedIn = !!token;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && loggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
