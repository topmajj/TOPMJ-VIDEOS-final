import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Calculate offset based on page and limit
    const offset = (page - 1) * limit

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Build the query - SIMPLIFIED to avoid join issues
    let query = supabase.from("videos").select("*", { count: "exact" })

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`)
    }

    // Add status filter if provided
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Add sorting
    query = query.order(sortBy as any, { ascending: sortOrder === "asc" })

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    // Execute the query
    const { data: videos, count, error } = await query

    if (error) {
      console.error("Error fetching videos:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get user information separately if needed
    const userIds = videos
      .map((video) => video.user_id)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index) // Unique values

    // Create a map to store user information
    const userMap = new Map()

    // Fetch user profiles if there are user IDs
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name").in("id", userIds)

      if (profiles) {
        profiles.forEach((profile) => {
          userMap.set(profile.id, {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
          })
        })
      }

      // Use service role to access auth.users for email information
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        const adminAuthClient = supabase.auth.admin

        // Fetch users in batches if needed
        const batchSize = 10
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batchIds = userIds.slice(i, i + batchSize)
          for (const userId of batchIds) {
            try {
              const { data: userData } = await adminAuthClient.getUserById(userId)
              if (userData?.user) {
                const existingUser = userMap.get(userId) || {}
                userMap.set(userId, {
                  ...existingUser,
                  email: userData.user.email,
                })
              }
            } catch (err) {
              console.error(`Error fetching user ${userId}:`, err)
            }
          }
        }
      }
    }

    // Enhance the video data with user information
    const enhancedVideos = videos.map((video) => {
      const user = userMap.get(video.user_id) || {
        id: video.user_id,
        first_name: null,
        last_name: null,
        email: null,
      }

      return {
        ...video,
        user,
      }
    })

    return NextResponse.json({
      videos: enhancedVideos,
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    })
  } catch (error: any) {
    console.error("Error in videos API route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
