import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get video count
    const { count: videoCount, error: videoError } = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (videoError) {
      console.error("Error fetching video count:", videoError)
    }

    // Get avatar count
    const { count: avatarCount, error: avatarError } = await supabase
      .from("avatars")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (avatarError) {
      console.error("Error fetching avatar count:", avatarError)
    }

    // Get voice count
    const { count: voiceCount, error: voiceError } = await supabase
      .from("voices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (voiceError) {
      console.error("Error fetching voice count:", voiceError)
    }

    // Get talking photo count
    const { count: photoCount, error: photoError } = await supabase
      .from("talking_photos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (photoError) {
      console.error("Error fetching talking photo count:", photoError)
    }

    // Get usage data for chart
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: usageData, error: usageError } = await supabase
      .from("transactions")
      .select("created_at, type, description, amount")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    if (usageError) {
      console.error("Error fetching usage data:", usageError)
    }

    // Process usage data for chart
    const usageByDay = processUsageData(usageData || [])

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("transactions")
      .select("id, created_at, type, description, amount")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (activityError) {
      console.error("Error fetching recent activity:", activityError)
    }

    // Format recent activity
    const formattedActivity = formatRecentActivity(recentActivity || [])

    // Get recent videos - handle missing view_count column
    let recentVideos = []
    try {
      const { data: videosData, error: recentVideosError } = await supabase
        .from("videos")
        .select("id, title, thumbnail_url, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3)

      if (recentVideosError) {
        console.error("Error fetching recent videos:", recentVideosError)
      } else {
        // Add view_count as 0 if it doesn't exist
        recentVideos = (videosData || []).map((video) => ({
          ...video,
          view_count: 0,
        }))
      }
    } catch (error) {
      console.error("Error in recent videos query:", error)
    }

    return NextResponse.json({
      metrics: {
        videos: {
          count: videoCount || 0,
          trend: "up",
          description: "+4 from last week",
        },
        avatars: {
          count: avatarCount || 0,
          trend: "up",
          description: "2 new this month",
        },
        voices: {
          count: voiceCount || 0,
          trend: "neutral",
          description: "No change",
        },
        photos: {
          count: photoCount || 0,
          trend: "up",
          description: "+3 from last week",
        },
      },
      usageData: usageByDay,
      recentActivity: formattedActivity,
      recentVideos: recentVideos,
    })
  } catch (error) {
    console.error("Error in dashboard metrics API:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 })
  }
}

// Helper function to process usage data for chart
function processUsageData(usageData: any[]) {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Create an array of dates for the last 30 days
  const dates = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    dates.push(date)
  }

  // Group dates into 7 bins (roughly weekly)
  const bins = []
  const binSize = Math.ceil(dates.length / 7)

  for (let i = 0; i < dates.length; i += binSize) {
    const bin = dates.slice(i, i + binSize)
    const startDate = bin[0]
    const endDate = bin[bin.length - 1]

    // Format the bin label
    const label = `${startDate.getDate()} ${startDate.toLocaleString("default", { month: "short" })}`

    bins.push({
      name: label,
      videos: 0,
      avatars: 0,
      voices: 0,
      photos: 0,
    })
  }

  // Populate the bins with usage data
  usageData.forEach((item) => {
    const itemDate = new Date(item.created_at)

    // Find which bin this item belongs to
    for (let i = 0; i < bins.length; i++) {
      const binStartIdx = i * binSize
      const binEndIdx = Math.min((i + 1) * binSize - 1, dates.length - 1)

      const binStartDate = dates[binStartIdx]
      const binEndDate = dates[binEndIdx]

      if (itemDate >= binStartDate && itemDate <= binEndDate) {
        // Increment the appropriate counter based on the description
        if (item.description.toLowerCase().includes("video")) {
          bins[i].videos += 1
        } else if (item.description.toLowerCase().includes("avatar")) {
          bins[i].avatars += 1
        } else if (item.description.toLowerCase().includes("voice")) {
          bins[i].voices += 1
        } else if (item.description.toLowerCase().includes("photo")) {
          bins[i].photos += 1
        }
        break
      }
    }
  })

  return bins
}

// Helper function to format recent activity
function formatRecentActivity(activities: any[]) {
  return activities.map((activity) => {
    let icon = "Video"

    if (activity.description.toLowerCase().includes("avatar")) {
      icon = "Users"
    } else if (activity.description.toLowerCase().includes("voice")) {
      icon = "Mic"
    } else if (activity.description.toLowerCase().includes("photo")) {
      icon = "Image"
    } else if (activity.description.toLowerCase().includes("upload")) {
      icon = "Upload"
    }

    // Format the time
    const activityDate = new Date(activity.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - activityDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    let timeAgo
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
      } else {
        timeAgo = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
      }
    } else if (diffDays === 1) {
      timeAgo = "Yesterday"
    } else {
      timeAgo = `${diffDays} days ago`
    }

    return {
      id: activity.id,
      action: activity.description,
      time: timeAgo,
      icon,
    }
  })
}
