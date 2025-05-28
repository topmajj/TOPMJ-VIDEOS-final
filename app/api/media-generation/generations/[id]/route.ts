import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("runway_generations").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting generation:", error)
      return NextResponse.json({ error: "Failed to delete generation" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete generation route:", error)
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}
