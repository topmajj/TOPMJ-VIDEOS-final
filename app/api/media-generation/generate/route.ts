import { type NextRequest, NextResponse } from "next/server"
import { generateImageFromText, generateVideoFromText, saveGeneration } from "@/lib/runway-api"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { prompt, type } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    let outputUrl: string

    if (type === "video") {
      outputUrl = await generateVideoFromText(prompt)
    } else {
      // Default to image
      outputUrl = await generateImageFromText(prompt)
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
