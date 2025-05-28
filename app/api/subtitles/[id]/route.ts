import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Missing subtitle ID" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase.from("subtitle_contents").select("*").eq("id", id).single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: "Subtitle not found" }, { status: 404 })
    }

    // Set appropriate content type based on format
    const headers = new Headers()
    if (data.format === "srt") {
      headers.set("Content-Type", "text/srt")
    } else if (data.format === "vtt") {
      headers.set("Content-Type", "text/vtt")
    } else {
      headers.set("Content-Type", "text/plain")
    }

    // Return the subtitle content directly
    return new Response(data.content, {
      headers,
      status: 200,
    })
  } catch (error) {
    console.error("Error retrieving subtitle:", error)
    return NextResponse.json({ error: "Failed to retrieve subtitle" }, { status: 500 })
  }
}
