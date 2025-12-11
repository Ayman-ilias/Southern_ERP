import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes
  const publicRoutes = [
    "/dashboard/login",
    "/dashboard/register",
    "/dashboard/forgot-password",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Get token from request headers or cookies
  const token = request.cookies.get("auth_token")?.value;

  console.log("[Middleware]", {
    pathname,
    hasToken: !!token,
    isPublicRoute
  });

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  // If accessing public route with token, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/dashboard/erp", request.url));
  }

  // Redirect root paths to dashboard
  if (pathname === "/" || pathname === "/dashboard") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard/erp", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
