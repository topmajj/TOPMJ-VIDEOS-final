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

    // Get the date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    // Fetch data for videos, avatars, voices, and talking photos for the last 30 days
    const [videosResult, photoAvatarsResult, voicesResult, runwayGenerationsResult] = await Promise.all([
      supabase
        .from("videos")
        .select("created_at")
        .gte("created_at", thirtyDaysAgoStr)
        .order("created_at", { ascending: true }),
      supabase
        .from("photo_avatars")
        .select("created_at")
        .gte("created_at", thirtyDaysAgoStr)
        .order("created_at", { ascending: true }),
      supabase
        .from("voice_clones")
        .select("created_at")
        .gte("created_at", thirtyDaysAgoStr)
        .order("created_at", { ascending: true }),
      supabase
        .from("runway_generations")
        .select("created_at")
        .gte("created_at", thirtyDaysAgoStr)
        .order("created_at", { ascending: true }),
    ])

    // Prepare data by date
    const dateMap = new Map()

    // Helper function to process each result set
    const processResults = (results: any, type: string) => {
      if (results.error) {
        console.error(`Error fetching ${type}:`, results.error)
        return
      }

      results.data?.forEach((item: any) => {
        const date = new Date(item.created_at).toISOString().split("T")[0]

        if (!dateMap.has(date)) {
          dateMap.set(date, {
            name: date,
            videos: 0,
            avatars: 0,
            voices: 0,
            photos: 0,
          })
        }

        const dayData = dateMap.get(date)
        dayData[type] += 1
        dateMap.set(date, dayData)
      })
    }

    // Process each data type
    processResults(videosResult, "videos")
    processResults(photoAvatarsResult, "avatars")
    processResults(voicesResult, "voices")
    processResults(runwayGenerationsResult, "photos")

    // Fill in missing dates in the last 30 days
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          name: dateStr,
          videos: 0,
          avatars: 0,
          voices: 0,
          photos: 0,
        })
      }
    }

    // Convert map to array and sort by date
    const chartData = Array.from(dateMap.values()).sort((a, b) => a.name.localeCompare(b.name))

    // Format dates to be more user-friendly (e.g., "May 5")
    chartData.forEach((item) => {
      const date = new Date(item.name)
      const month = date.toLocaleString("default", { month: "short" })
      const day = date.getDate()
      item.name = `${month} ${day}`
    })

    return NextResponse.json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    console.error("Error fetching usage analytics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
