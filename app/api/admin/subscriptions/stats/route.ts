import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify admin status
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get subscription stats
    const { data: subscriptions } = await supabase.from("subscriptions").select("plan").eq("status", "active")

    // Calculate plan percentages
    const plans =
      subscriptions?.reduce(
        (acc, sub) => {
          acc[sub.plan] = (acc[sub.plan] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    const totalSubs = Object.values(plans).reduce((sum, count) => sum + count, 0)

    // Format the response
    const planStats = Object.entries(plans).map(([plan, count]) => ({
      plan,
      count,
      percentage: totalSubs > 0 ? Math.round((count / totalSubs) * 100) : 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        plans: planStats,
        total: totalSubs,
      },
    })
  } catch (error) {
    console.error("Error fetching subscription stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
