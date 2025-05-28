import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
    const avatarId = params.id

    // Check if the avatar belongs to the user
    const { data: avatar, error: fetchError } = await supabase
      .from("photo_avatars")
      .select("*")
      .eq("id", avatarId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !avatar) {
      return NextResponse.json({ error: "Avatar not found or access denied" }, { status: 404 })
    }

    // Delete the avatar
    const { error: deleteError } = await supabase
      .from("photo_avatars")
      .delete()
      .eq("id", avatarId)
      .eq("user_id", userId)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete avatar", details: deleteError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Avatar deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting photo avatar:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
