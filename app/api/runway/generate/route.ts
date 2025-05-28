import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { saveGeneration } from "@/lib/media-generation-api"

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
    const { prompt, type = "image" } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if API key exists
    const apiKey = process.env.RUNWAY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Runway API key is not configured" }, { status: 500 })
    }

    console.log(`Generating ${type} with prompt: ${prompt}`)

    // Different endpoint and payload based on type
    let endpoint = "https://api.runwayml.com/v1/generationss"
    let payload = {}

    if (type === "video") {
      endpoint = "https://api.runwayml.com/v1/text-to-video"
      payload = {
        prompt,
        duration: 4, // 4 seconds
        model: "gen-3-alpha-turbo",
      }
    } else {
      // Default to image
      endpoint = "https://api.runwayml.com/v1/text-to-image"
      payload = {
        prompt,
        model: "stable-diffusion-xl-turbo",
      }
    }

    console.log(`Calling Runway API at ${endpoint}`)

    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Runway API response:", response.status)

    // Extract URL from response based on type
    let outputUrl = ""
    if (type === "video") {
      outputUrl = response.data.url || response.data.output?.url
    } else {
      outputUrl = response.data.url || response.data.output?.url
    }

    if (!outputUrl) {
      console.error("No URL found in response:", response.data)
      return NextResponse.json({ error: "No URL found in API response" }, { status: 500 })
    }

    // Save the generation to the database
    const generationId = await saveGeneration(userId, prompt, type === "video" ? "video" : "image", outputUrl)

    return NextResponse.json({
      id: generationId,
      url: outputUrl,
      prompt,
      type: type === "video" ? "video" : "image",
    })
  } catch (error) {
    console.error("Error in generate route:", error)

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
