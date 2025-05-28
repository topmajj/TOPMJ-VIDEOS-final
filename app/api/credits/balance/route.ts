import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's credits
    const { data: credits, error } = await supabase
      .from("credits")
      .select("total, used, expires_at")
      .eq("user_id", session.user.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    if (error) {
      console.error("Error fetching credits:", error)
      return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
    }

    // Calculate total remaining credits
    const balance = credits.reduce((sum, credit) => {
      const remaining = credit.total - credit.used
      return sum + remaining
    }, 0)

    return NextResponse.json({ balance })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
