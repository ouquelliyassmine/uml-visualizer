// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/dashboard") {
    // Redirect => كيبدّل الـ URL
    return NextResponse.redirect(new URL("/dashboard/tickets/overview", req.url));
    // ولا بدلها بـ rewrite إلا بغيتي يبقى URL هو /dashboard ويعرض محتوى overview:
    // return NextResponse.rewrite(new URL("/dashboard/tickets/overview", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // غير هاد المسار
}; 




