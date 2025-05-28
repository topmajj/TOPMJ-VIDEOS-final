import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const userId = params.id

    // Get user from auth.users table using admin client
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError || !authUser) {
      console.error("Error fetching auth user:", authError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get profile data
    const { data: userProfile, error: profileError2 } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    // Merge auth user with profile
    const user = {
      ...authUser.user,
      profile: userProfile || {},
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in user API route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const userId = params.id
    const data = await request.json()

    // Update profile data
    if (data.profile) {
      const { error: updateProfileError } = await supabaseAdmin
        .from("profiles")
        .update({
          first_name: data.profile.first_name,
          last_name: data.profile.last_name,
          is_admin: data.profile.is_admin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
    }

    // Update auth user data if needed
    if (data.email || data.password || data.user_metadata) {
      const updateData: any = {}

      if (data.email) updateData.email = data.email
      if (data.password) updateData.password = data.password
      if (data.user_metadata) updateData.user_metadata = data.user_metadata

      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData)

      if (updateAuthError) {
        console.error("Error updating auth user:", updateAuthError)
        return NextResponse.json({ error: "Failed to update user authentication data" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update user API route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const userId = params.id

    // Delete user from auth.users table using admin client
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete user API route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
