import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "all"
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Build the query
    let query = supabase.from("runway_generations").select("*", { count: "exact" })

    // Apply status filter if not "all"
    if (status !== "all") {
      query = query.eq("status", status)
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`prompt.ilike.%${search}%,type.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === "asc" })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: generations, error, count } = await query

    if (error) {
      console.error("Error fetching runway generations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch user information for each generation
    const userIds = [...new Set(generations.map((gen) => gen.user_id))]

    let users: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds)

      if (usersData) {
        users = usersData.reduce(
          (acc, user) => {
            acc[user.id] = user
            return acc
          },
          {} as Record<string, any>,
        )
      }
    }

    // Add user information to each generation
    const generationsWithUsers = generations.map((gen) => ({
      ...gen,
      user: users[gen.user_id] || null,
    }))

    return NextResponse.json({
      data: generationsWithUsers,
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    })
  } catch (error) {
    console.error("Error in runway generations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
