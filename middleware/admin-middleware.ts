import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function adminMiddleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  // Get the pathname
  const pathname = req.nextUrl.pathname

  // Only run on admin routes
  if (!pathname.startsWith("/admin")) {
    return res
  }

  // Allow access to admin login page without authentication
  if (pathname === "/admin/login") {
    return res
  }

  // Create a Supabase client
  const supabase = createMiddlewareClient({ req, res })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to admin login
  if (!session) {
    const url = new URL("/admin/login", req.url)
    return NextResponse.redirect(url)
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  // If not an admin, redirect to the main dashboard
  if (!profile || !profile.is_admin) {
    const url = new URL("/dashboard", req.url)
    return NextResponse.redirect(url)
  }

  // Allow access to admin routes
  return res
}
