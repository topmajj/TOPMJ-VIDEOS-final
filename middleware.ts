import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminMiddleware } from "./middleware/admin-middleware"

export async function middleware(req: NextRequest) {
  // Check if this is an admin route
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(req)
  }

  // Create a response object
  const res = NextResponse.next()

  // Create a Supabase client
  const supabase = createMiddlewareClient({ req, res })

  // Get the session
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

  // Return the response
  return res
}

// Run middleware on dashboard and admin routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
