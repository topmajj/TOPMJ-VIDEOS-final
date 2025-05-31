import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
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
  const isAdminLoginRoute = req.nextUrl.pathname === "/admin/login"
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") && !isAdminLoginRoute

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

  // If the user is not authenticated and trying to access an admin route (but not admin login)
  if (!isAuthenticated && isAdminRoute) {
    const redirectUrl = new URL("/admin/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated and trying to access admin routes, check if they're an admin
  if (isAuthenticated && isAdminRoute) {
    try {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

      // If not an admin, redirect to the dashboard
      if (!profile || !profile.is_admin) {
        const redirectUrl = new URL("/dashboard", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      // If there's an error checking admin status, redirect to dashboard
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If the user is authenticated and trying to access the admin login page
  if (isAuthenticated && isAdminLoginRoute) {
    try {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

      // If they're an admin, redirect to the admin dashboard
      if (profile && profile.is_admin) {
        const redirectUrl = new URL("/admin/dashboard", req.url)
        return NextResponse.redirect(redirectUrl)
      } else {
        // If they're not an admin, redirect to regular dashboard
        const redirectUrl = new URL("/dashboard", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      // If there's an error, redirect to dashboard
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }
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
