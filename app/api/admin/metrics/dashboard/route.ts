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

    // Get counts from all tables
    const [
      usersCountResult,
      videosCountResult,
      voiceCountResult,
      avatarsCountResult,
      runwayGenerationsResult,
      transactionsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("videos").select("*", { count: "exact", head: true }),
      supabase.from("voice_clones").select("*", { count: "exact", head: true }),
      supabase.from("photo_avatars").select("*", { count: "exact", head: true }),
      supabase.from("runway_generations").select("*", { count: "exact", head: true }),
      supabase.from("transactions").select("amount, type"),
    ])

    // Calculate total revenue from transactions
    const totalRevenue =
      transactionsResult.data?.filter((t) => t.type === "purchase").reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // Get recent users and videos
    const [recentUsersResult, recentVideosResult, recentGenerationsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, created_at, email:auth.users!id(email)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("videos")
        .select(
          "id, title, status, created_at, user_id, profiles!inner(first_name, last_name, email:auth.users!id(email))",
        )
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("runway_generations")
        .select(
          "id, user_id, prompt, type, status, created_at, profiles!inner(first_name, last_name, email:auth.users!id(email))",
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ])

    // Calculate growth percentages
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const [lastMonthVideosResult, prevMonthVideosResult, lastMonthUsersResult, prevMonthUsersResult] =
      await Promise.all([
        supabase
          .from("videos")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("videos")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sixtyDaysAgo.toISOString())
          .lt("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sixtyDaysAgo.toISOString())
          .lt("created_at", thirtyDaysAgo.toISOString()),
      ])

    // Calculate growth percentages
    const videoGrowth =
      prevMonthVideosResult.count && prevMonthVideosResult.count > 0
        ? Math.round(
            (((lastMonthVideosResult.count || 0) - prevMonthVideosResult.count) / prevMonthVideosResult.count) * 100,
          )
        : 0

    const userGrowth =
      prevMonthUsersResult.count && prevMonthUsersResult.count > 0
        ? Math.round(
            (((lastMonthUsersResult.count || 0) - prevMonthUsersResult.count) / prevMonthUsersResult.count) * 100,
          )
        : 0

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          users: usersCountResult.count || 0,
          videos: videosCountResult.count || 0,
          voiceClones: voiceCountResult.count || 0,
          photoAvatars: avatarsCountResult.count || 0,
          mediaGenerations: runwayGenerationsResult.count || 0,
          revenue: totalRevenue,
        },
        growth: {
          users: userGrowth,
          videos: videoGrowth,
        },
        recent: {
          users: recentUsersResult.data || [],
          videos: recentVideosResult.data || [],
          generations: recentGenerationsResult.data || [],
        },
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
