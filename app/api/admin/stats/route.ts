import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  try {
    // Get total users count
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (usersError) throw usersError

    // Get total videos count
    const { count: videosCount, error: videosError } = await supabaseAdmin
      .from("videos")
      .select("*", { count: "exact", head: true })

    if (videosError) throw videosError

    // Get videos created in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentVideosCount, error: recentVideosError } = await supabaseAdmin
      .from("videos")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString())

    if (recentVideosError) throw recentVideosError

    return NextResponse.json({
      usersCount,
      videosCount,
      recentVideosCount,
      // Add more stats as needed
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred while fetching stats" }, { status: 500 })
  }
}
