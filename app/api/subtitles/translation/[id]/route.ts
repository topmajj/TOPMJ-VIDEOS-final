import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const translationId = params.id

    if (!translationId) {
      return NextResponse.json({ error: "Missing translation ID" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // First, check if the translation_id column exists
    const { data: columnExists, error: columnCheckError } = await supabase.rpc("get_table_info", {
      table_name: "subtitle_contents",
    })

    if (columnCheckError) {
      console.error("Error checking column existence:", columnCheckError)
      // If we can't check, assume the column exists and proceed
    }

    const hasTranslationIdColumn =
      !columnCheckError && columnExists && columnExists.some((col: any) => col.column_name === "translation_id")

    // Get subtitle by translation ID
    let data, error

    if (hasTranslationIdColumn) {
      const result = await supabase
        .from("subtitle_contents")
        .select("*")
        .eq("translation_id", translationId)
        .maybeSingle()

      data = result.data
      error = result.error
    } else {
      // Fallback to using id as the identifier
      const result = await supabase.from("subtitle_contents").select("*").eq("id", translationId).maybeSingle()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error("Error fetching subtitle:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Subtitle not found" }, { status: 404 })
    }

    // Return the subtitle content directly
    return new Response(data.content, {
      headers: {
        "Content-Type": data.format === "json" ? "application/json" : "text/plain",
      },
    })
  } catch (error) {
    console.error("Error retrieving subtitle:", error)
    return NextResponse.json({ error: "Failed to retrieve subtitle" }, { status: 500 })
  }
}
