import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { userId } = await request.json()

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user already has a profile
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .limit(1)

    if (checkError) {
      console.error("Error checking existing profile:", checkError)
      return NextResponse.json({ error: "Failed to check existing profile" }, { status: 500 })
    }

    // If user already has a profile, don't add more
    if (existingProfile && existingProfile.length > 0) {
      return NextResponse.json({
        success: true,
        message: "User already has a profile",
        skipped: true,
      })
    }

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData.user) {
      console.error("Error fetching user data:", userError)
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    // Add profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email: userData.user.email,
    })

    if (profileError) {
      console.error("Error adding profile:", profileError)
      return NextResponse.json({ error: "Failed to add profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile added successfully",
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
