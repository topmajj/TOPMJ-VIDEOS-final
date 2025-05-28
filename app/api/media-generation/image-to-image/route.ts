import { type NextRequest, NextResponse } from "next/server"
import { transformImage, uploadImageToStorage, saveGeneration } from "@/lib/runway-api"
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
    const formData = await req.formData()
    const prompt = formData.get("prompt") as string
    const imageFile = formData.get("image") as File

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    // Upload the image to Supabase storage
    const imageUrl = await uploadImageToStorage(userId, imageFile)

    // Transform the image using RunwayML
    const outputUrl = await transformImage(imageUrl, prompt)

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
