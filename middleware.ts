import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminMiddleware } from "./lib/admin-middleware"

export async function middleware(req: NextRequest) {
  // Handle admin routes with separate middleware
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(req)
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session

  // Define auth routes that don't require authentication
  const authRoutes = [
    "/login",
    "/signup",
    "/auth/reset-password",
    "/auth/reset-password-sent",
    "/auth/update-password",
    "/auth/verification-sent",
    "/auth/confirm",
  ]

  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Special case for the root path - redirect to dashboard if authenticated
  if (req.nextUrl.pathname === "/" && isAuthenticated) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("from", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated and trying to access an auth route
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
