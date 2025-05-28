import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
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

    // Fetch all photo avatars for the user
    const { data: photoAvatars, error } = await supabase
      .from("photo_avatars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch photo avatars", details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      photoAvatars,
    })
  } catch (error) {
    console.error("Error fetching photo avatars:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
