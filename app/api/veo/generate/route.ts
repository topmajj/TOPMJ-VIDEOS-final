import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "16:9" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if Google API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google API key not configured" }, { status: 500 })
    }

    // Get user from session using the correct Supabase client
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    })

    // Generate unique ID for this generation
    const generationId = uuidv4()

    try {
      // Start video generation with Google Veo
      const operation = await ai.models.generateVideos({
        model: "veo-2.0-generate-001",
        prompt,
        config: {
          aspectRatio: aspectRatio as "16:9" | "9:16" | "1:1",
          numberOfVideos: 1,
        },
      })

      // Store generation in database
      const { error: dbError } = await supabase.from("veo_generations").insert({
        id: generationId,
        user_id: user.id,
        prompt,
        aspect_ratio: aspectRatio,
        status: "processing",
        operation_id: operation.name,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("Database error:", dbError)
        return NextResponse.json({ error: "Failed to save generation" }, { status: 500 })
      }

      return NextResponse.json({
        id: generationId,
        operationId: operation.name,
        status: "processing",
      })
    } catch (veoError) {
      console.error("Google Veo API error:", veoError)
      return NextResponse.json(
        { error: "Failed to start video generation. Please check your Google API configuration." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
