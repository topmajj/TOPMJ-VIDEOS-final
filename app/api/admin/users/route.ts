import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated and is an admin
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get URL parameters for pagination and filtering
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "50")
    const search = url.searchParams.get("search") || ""
    const sortBy = url.searchParams.get("sortBy") || "created_at"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    const filter = url.searchParams.get("filter") || "all"

    // Calculate pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Get profiles data first
    let profilesQuery = supabaseAdmin
      .from("profiles")
      .select("*")
      .order(sortBy as any, { ascending: sortOrder === "asc" })

    // Apply search filter to profiles
    if (search) {
      const searchLower = search.toLowerCase()
      profilesQuery = profilesQuery.or(
        `first_name.ilike.%${searchLower}%,last_name.ilike.%${searchLower}%,email.ilike.%${searchLower}%`,
      )
    }

    // Apply additional filters
    if (filter === "admins") {
      profilesQuery = profilesQuery.eq("is_admin", true)
    } else if (filter === "recent") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      profilesQuery = profilesQuery.gte("created_at", thirtyDaysAgo.toISOString())
    }

    const { data: profiles, error: profilesError } = await profilesQuery

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    // Get auth users data using the admin client
    let authUsers: any[] = []
    try {
      // Get all users from auth.users - note: this might need pagination for large datasets
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000, // Get more users to ensure we have all we need
      })

      if (authError) {
        console.error("Error fetching auth users:", authError)
        // Fallback: use profiles data only
        authUsers =
          profiles?.map((profile) => ({
            id: profile.id,
            email: profile.email || "No email",
            created_at: profile.created_at,
            last_sign_in_at: null,
            email_confirmed_at: null,
          })) || []
      } else {
        authUsers = authData.users || []
      }
    } catch (authError) {
      console.error("Auth API error:", authError)
      // Fallback: use profiles data only
      authUsers =
        profiles?.map((profile) => ({
          id: profile.id,
          email: profile.email || "No email",
          created_at: profile.created_at,
          last_sign_in_at: null,
          email_confirmed_at: null,
        })) || []
    }

    // Merge auth users with profiles
    const users = (profiles || []).map((profile) => {
      const authUser = authUsers.find((u) => u.id === profile.id) || {
        id: profile.id,
        email: profile.email || "No email",
        created_at: profile.created_at,
        last_sign_in_at: null,
        email_confirmed_at: null,
      }
      return {
        ...authUser,
        profile,
      }
    })

    // Filter users based on search term (if not already filtered in query)
    let filteredUsers = users
    if (search && !profilesError) {
      const searchLower = search.toLowerCase()
      filteredUsers = users.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.profile?.first_name?.toLowerCase().includes(searchLower) ||
          user.profile?.last_name?.toLowerCase().includes(searchLower),
      )
    }

    // Apply additional filters for auth-specific data
    if (filter === "inactive") {
      // Example: Users who haven't logged in for 90 days
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      filteredUsers = filteredUsers.filter(
        (user) => !user.last_sign_in_at || new Date(user.last_sign_in_at) < ninetyDaysAgo,
      )
    }

    // Calculate total for pagination
    const total = filteredUsers.length

    // Apply pagination to filtered results
    const paginatedUsers = filteredUsers.slice(from, to + 1)

    return NextResponse.json({
      users: paginatedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error("Error in users API route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
