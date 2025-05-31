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

  // Refresh the session
  await supabase.auth.getSession()

  // Return the response
  return res
}

// Run middleware on dashboard and admin routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
