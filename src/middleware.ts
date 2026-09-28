import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

// Melindungi seluruh halaman /admin dan API /api/admin/* agar hanya bisa
// diakses setelah login. Halaman publik (/, /laporan), halaman login
// (/masuk), dan /api/auth/* tidak disentuh.
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Anda harus masuk terlebih dahulu." }, { status: 401 });
    }
    const loginUrl = new URL("/masuk", request.url);
    loginUrl.searchParams.set("dari", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
