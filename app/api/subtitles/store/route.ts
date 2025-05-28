import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { translationId, content, format, language } = await request.json()

    if (!translationId || !content || !format) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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

    // Check if subtitle already exists for this translation
    let existingSubtitle
    let queryError

    if (hasTranslationIdColumn) {
      const result = await supabase
        .from("subtitle_contents")
        .select("*")
        .eq("translation_id", translationId)
        .maybeSingle()

      existingSubtitle = result.data
      queryError = result.error
    } else {
      // Fallback to using id as the identifier (assuming that's how it was set up before)
      const result = await supabase.from("subtitle_contents").select("*").eq("id", translationId).maybeSingle()

      existingSubtitle = result.data
      queryError = result.error
    }

    if (queryError) {
      console.error("Error checking for existing subtitle:", queryError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    let result
    if (existingSubtitle) {
      // Update existing subtitle
      const { data, error } = await supabase
        .from("subtitle_contents")
        .update({
          content,
          format,
          language: language || existingSubtitle.language,
          updated_at: new Date().toISOString(),
          ...(hasTranslationIdColumn ? { translation_id: translationId } : {}),
        })
        .eq(hasTranslationIdColumn ? "translation_id" : "id", translationId)
        .select()

      if (error) {
        console.error("Error updating subtitle:", error)
        return NextResponse.json({ error: "Failed to update subtitle" }, { status: 500 })
      }

      result = data?.[0]
    } else {
      // Insert new subtitle
      const insertData = {
        content,
        format,
        language: language || "unknown",
        ...(hasTranslationIdColumn ? { translation_id: translationId } : { id: translationId }), // Use id if translation_id doesn't exist
      }

      const { data, error } = await supabase.from("subtitle_contents").insert(insertData).select()

      if (error) {
        console.error("Error inserting subtitle:", error)
        return NextResponse.json({ error: "Failed to insert subtitle" }, { status: 500 })
      }

      result = data?.[0]
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error storing subtitle:", error)
    return NextResponse.json({ error: "Failed to store subtitle" }, { status: 500 })
  }
}
