import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { saveGeneration, uploadImageToStorage } from "@/lib/media-generation-api"

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
    const prompt = formData.get("prompt") as string
    const imageFile = formData.get("image") as File

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    // Check if API key exists
    const apiKey = process.env.RUNWAY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Runway API key is not configured" }, { status: 500 })
    }

    // Upload the image to Supabase storage
    const imageUrl = await uploadImageToStorage(userId, imageFile)
    console.log(`Uploaded image to: ${imageUrl}`)

    // Call Runway API for image-to-image transformation
    const response = await axios.post(
      "https://api.runwayml.com/v1/image-to-image",
      {
        prompt,
        image_url: imageUrl,
        model: "stable-diffusion-xl-turbo",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("Runway API response:", response.status)

    // Extract URL from response
    const outputUrl = response.data.url || response.data.output?.url

    if (!outputUrl) {
      console.error("No URL found in response:", response.data)
      return NextResponse.json({ error: "No URL found in API response" }, { status: 500 })
    }

    // Save the generation to the database
    const generationId = await saveGeneration(userId, prompt, "image-to-image", outputUrl, imageUrl)

    return NextResponse.json({
      id: generationId,
      url: outputUrl,
      prompt,
      inputUrl: imageUrl,
      type: "image-to-image",
    })
  } catch (error) {
    console.error("Error in image-to-image route:", error)

    // Extract more detailed error information
    let errorMessage = "An unknown error occurred"
    let statusCode = 500

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error || error.message
      statusCode = error.response?.status || 500
      console.error("Axios error details:", {
        status: error.response?.status,
        data: error.response?.data,
      })
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
