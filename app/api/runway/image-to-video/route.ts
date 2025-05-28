import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { uploadImageToStorage } from "@/lib/media-generation-api"

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const formData = await req.formData()
    const promptText = formData.get("promptText") as string
    const imageFile = formData.get("image") as File
    const duration = Number.parseInt(formData.get("duration") as string) || 5
    const ratio = (formData.get("ratio") as string) || "1280:768"

    if (!promptText) {
      return NextResponse.json({ error: "Prompt text is required" }, { status: 400 })
    }

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    // Check if API key exists
    let apiKey = process.env.RUNWAY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Runway API key is not configured" }, { status: 500 })
    }

    // Make sure the API key starts with 'key_'
    if (!apiKey.startsWith("key_")) {
      apiKey = `key_${apiKey}`
    }

    try {
      // Upload the image to Supabase storage
      const imageUrl = await uploadImageToStorage(userId, imageFile)
      console.log(`Uploaded image to: ${imageUrl}`)

      // Prepare the request body
      const requestBody = {
        model: "gen3a_turbo",
        promptImage: imageUrl,
        promptText,
        duration,
        ratio,
      }

      // Log the exact headers we're sending
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      }

      console.log("Making Runway API request with headers:", {
        Authorization: `Bearer ${apiKey.substring(0, 10)}...`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      })
      console.log("Request body:", requestBody)

      // Call Runway API using fetch - FIXED URL
      const response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })

      // Log the response headers
      console.log("Response headers:", Object.fromEntries([...response.headers.entries()]))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Runway API error:", response.status, errorText)

        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || `API returned status ${response.status}`)
        } catch (e) {
          throw new Error(`API returned status ${response.status}: ${errorText}`)
        }
      }

      const data = await response.json()
      console.log("Runway API response:", response.status, data)

      // Save the task to the database
      const { data: insertData, error } = await supabase
        .from("runway_generations")
        .insert({
          user_id: userId,
          type: "video",
          prompt: promptText,
          input_image_url: imageUrl,
          status: "processing",
          runway_task_id: data.id,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error saving task to database:", error)
      }

      // Return the task ID
      return NextResponse.json({
        id: data.id,
        status: "PENDING",
      })
    } catch (uploadError) {
      console.error("Error during upload or API call:", uploadError)
      throw uploadError
    }
  } catch (error) {
    console.error("Error in image-to-video route:", error)

    let errorMessage = "An unknown error occurred"
    const statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
