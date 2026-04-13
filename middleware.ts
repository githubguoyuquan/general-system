import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/** RBAC：/admin 需管理员；/account 需登录 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (req.auth.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  if (pathname.startsWith("/account")) {
    if (!req.auth?.user) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
