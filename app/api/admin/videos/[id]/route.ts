import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET a single video
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id

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

    // Fetch the video
    const { data: video, error } = await supabase
      .from("videos")
      .select(
        `
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email:auth_users (
            email
          )
        )
      `,
      )
      .eq("id", videoId)
      .single()

    if (error) {
      console.error("Error fetching video:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error: any) {
    console.error("Error in video GET API route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH to update a video
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id
    const updates = await request.json()

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

    // Update the video
    const { data: updatedVideo, error } = await supabase
      .from("videos")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .select()
      .single()

    if (error) {
      console.error("Error updating video:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedVideo)
  } catch (error: any) {
    console.error("Error in video PATCH API route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE a video
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id

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

    // Delete the video
    const { error } = await supabase.from("videos").delete().eq("id", videoId)

    if (error) {
      console.error("Error deleting video:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in delete video API route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
