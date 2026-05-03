import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/** RBAC：/admin · /m/admin 管理员；/account · /m/account 登录用户 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isDesktopAdmin = pathname.startsWith("/admin");
  const isMobileAdmin = pathname.startsWith("/m/admin");

  if (isDesktopAdmin || isMobileAdmin) {
    if (!req.auth?.user) {
      const loginUrl = isMobileAdmin ? "/m/login" : "/login";
      const url = new URL(loginUrl, req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (req.auth.user.role !== "admin") {
      const fallback = isMobileAdmin ? "/m" : "/";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
  }

  if (pathname.startsWith("/account") || pathname.startsWith("/m/account")) {
    if (!req.auth?.user) {
      const loginUrl = pathname.startsWith("/m/") ? "/m/login" : "/login";
      const url = new URL(loginUrl, req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/m/admin",
    "/m/admin/:path*",
    "/account",
    "/account/:path*",
    "/m/account",
    "/m/account/:path*",
  ],
};
