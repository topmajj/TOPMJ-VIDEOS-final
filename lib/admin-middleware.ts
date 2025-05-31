import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function adminMiddleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthenticated = !!session
  const isAdminLoginRoute = req.nextUrl.pathname === "/admin/login"

  // If user is not authenticated and trying to access any admin route except login
  if (!isAuthenticated && !isAdminLoginRoute) {
    const redirectUrl = new URL("/admin/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated
  if (isAuthenticated) {
    // If trying to access admin login page, check if they're admin and redirect accordingly
    if (isAdminLoginRoute) {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

      if (profile && profile.is_admin) {
        const redirectUrl = new URL("/admin/dashboard", req.url)
        return NextResponse.redirect(redirectUrl)
      } else {
        // Not an admin, redirect to main dashboard
        const redirectUrl = new URL("/dashboard", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // Accessing other admin routes, check if they're admin
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

      if (!profile || !profile.is_admin) {
        const redirectUrl = new URL("/dashboard", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return res
}
