import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const translationId = searchParams.get("translation_id")

    if (!translationId) {
      return NextResponse.json(
        {
          error: "Missing translation_id parameter",
        },
        { status: 400 },
      )
    }

    const apiKey = process.env.HEYGEN_API_KEY
    if (!apiKey) {
      console.error("HEYGEN_API_KEY is not defined")
      return NextResponse.json(
        {
          error: "API key is not configured",
          details: "Please add your HeyGen API key to the environment variables.",
        },
        { status: 500 },
      )
    }

    console.log(`Checking status for translation ${translationId}...`)

    // Use the correct endpoint as per the documentation
    const response = await fetch(`https://api.heygen.com/v2/video_translate/${translationId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    })

    // Handle 403 Forbidden (API key doesn't have access to this feature)
    if (response.status === 403) {
      return NextResponse.json(
        {
          error: "Access denied to Video Translation API",
          details:
            "Your HeyGen API key doesn't have access to the Video Translation feature. This feature requires a Scale or Enterprise tier subscription.",
        },
        { status: 403 },
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`Error response from HeyGen API for translation ${translationId}:`, errorData)
      return NextResponse.json(
        {
          error: "Failed to check translation status",
          details: errorData.error || `API returned status ${response.status}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`Translation status response for ${translationId}:`, data)

    // Update the database with the latest status
    const supabase = createRouteHandlerClient({ cookies })
    const status = data.data?.status || "processing"
    const url = data.data?.url || null

    try {
      const { error: dbError } = await supabase
        .from("video_translations")
        .update({
          status: status,
          video_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq("heygen_translation_id", translationId)

      if (dbError) {
        console.error("Database error:", dbError)
      }
    } catch (dbError) {
      console.error("Error updating translation in database:", dbError)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error checking translation status:", error)
    return NextResponse.json(
      {
        error: "Failed to check translation status",
        details: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
