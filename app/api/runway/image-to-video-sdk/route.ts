import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { uploadImageToStorage } from "@/lib/media-generation-api"
import axios from "axios"

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

      // Convert the image to a data URI
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString("base64")
      const dataUri = `data:${imageFile.type};base64,${base64}`

      console.log(`Converted image to data URI (first 100 chars): ${dataUri.substring(0, 100)}...`)

      // Make a direct API call to Runway
      const response = await axios.post(
        "https://api.dev.runwayml.com/v1/image_to_video",
        {
          model: "gen3a_turbo",
          promptImage: dataUri,
          promptText,
          duration,
          ratio,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Runway-Version": "2024-11-06",
          },
        },
      )

      console.log("Runway API response:", response.status, response.data)

      // Save the generation to the database
      const { data: generationData, error: insertError } = await supabase
        .from("runway_generations")
        .insert({
          user_id: user.id,
          prompt: promptText,
          type: "video",
          status: "processing",
          input_image_url: imageUrl,
          runway_task_id: response.data.id, // Make sure we're saving the task ID
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error saving generation:", insertError)
        throw new Error("Failed to save generation")
      }

      // Return the task ID
      return NextResponse.json({
        id: response.data.id,
        status: "PENDING",
      })
    } catch (uploadError) {
      console.error("Error during upload or API call:", uploadError)
      throw uploadError
    }
  } catch (error) {
    console.error("Error in image-to-video-sdk route:", error)

    let errorMessage = "An unknown error occurred"
    const statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
