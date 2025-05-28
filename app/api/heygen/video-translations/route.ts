import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: Request) {
  try {
    console.log("Creating video translation...")
    const startTime = Date.now()

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

    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    if (!userId) {
      console.warn("No user ID found in session, cannot create video translation without user association")
      return NextResponse.json(
        {
          error: "Authentication required to create video translations",
          details: "Please log in to use this feature.",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { video_url, output_language, title } = body

    if (!video_url || !output_language) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "video_url and output_language are required",
        },
        { status: 400 },
      )
    }

    console.log("Sending video translation request to HeyGen API...")
    const response = await fetch("https://api.heygen.com/v2/video_translate", {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_url,
        output_language,
        title: title || `Translation to ${output_language} ${new Date().toLocaleDateString()}`,
      }),
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
      console.error("Error response from HeyGen API:", errorData)
      return NextResponse.json(
        {
          error: "Failed to create video translation",
          details: errorData.error || `API returned status ${response.status}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Video translation response:", data)

    const video_translate_id = data.data?.video_translate_id

    if (!video_translate_id) {
      console.error("No video_translate_id returned from API")
      return NextResponse.json(
        {
          error: "Failed to create video translation",
          details: "No translation ID was returned from the API",
        },
        { status: 500 },
      )
    }

    // Store the translation in the database
    try {
      const { error: dbError } = await supabase.from("video_translations").insert({
        heygen_translation_id: video_translate_id,
        title: title || `Translation to ${output_language} ${new Date().toLocaleDateString()}`,
        status: "processing",
        source_video_url: video_url,
        target_language: output_language,
        user_id: userId,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("Database error:", dbError)
        // Continue even if database storage fails
        console.warn("Failed to store translation in database, but translation was created")
      }
    } catch (dbError) {
      console.error("Error storing translation in database:", dbError)
      // Continue even if database storage fails
    }

    const endTime = Date.now()
    console.log(`Generated translation in ${endTime - startTime}ms, translation_id: ${video_translate_id}`)

    return NextResponse.json({
      success: true,
      message: "Video translation created successfully",
      data: {
        video_translate_id,
        status: "processing",
      },
    })
  } catch (error) {
    console.error("Error creating video translation:", error)
    return NextResponse.json(
      {
        error: "Failed to create video translation",
        details: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
