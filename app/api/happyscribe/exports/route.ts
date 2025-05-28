import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createTranscription, createTranslationOrder } from "@/lib/happyscribe-client"
import type { TranslationRequest } from "@/types/happyscribe"

export async function POST(request: NextRequest) {
  try {
    // Check if organization ID is configured
    if (!process.env.HAPPY_SCRIBE_ORGANIZATION_ID) {
      return NextResponse.json(
        {
          error:
            "Happy Scribe organization ID is not configured. Please add HAPPY_SCRIBE_ORGANIZATION_ID to your environment variables.",
        },
        { status: 500 },
      )
    }

    const supabase = createServerComponentClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as TranslationRequest
    const { video_url, output_language, title } = body

    if (!video_url) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 })
    }

    if (!output_language) {
      return NextResponse.json({ error: "Output language is required" }, { status: 400 })
    }

    console.log("Creating Happy Scribe translation with:", { video_url, output_language, title })

    // Step 1: Create a transcription from the video URL
    const transcription = await createTranscription({
      name: title || `Translation to ${output_language} ${new Date().toLocaleDateString()}`,
      language: "en-US", // Source language (assuming English)
      tmp_url: video_url,
      is_subtitle: true, // Important for translation use case
      service: "auto",
    })

    console.log("Transcription created:", transcription)

    // Step 2: Create a translation order
    const order = await createTranslationOrder({
      source_transcription_id: transcription.id,
      target_languages: [output_language],
      service: "auto",
      confirm: true, // Auto-confirm the order
    })

    console.log("Translation order created:", order)

    // Save the initial record to the database
    const { data: initialData, error: initialError } = await supabase
      .from("happyscribe_translations")
      .insert({
        user_id: user.id,
        transcription_id: transcription.id,
        export_id: "pending", // Use a placeholder value
        order_id: order.id, // Store the order ID
        title: title || `Translation to ${output_language} ${new Date().toLocaleDateString()}`,
        status: mapOrderStateToStatus(order.state),
        source_video_url: video_url,
        target_language: output_language,
        download_url: null,
        format: "srt",
      })
      .select()
      .single()

    if (initialError) {
      console.error("Error saving initial translation to database:", initialError)
      return NextResponse.json({ error: "Failed to save translation" }, { status: 500 })
    }

    // Return the initial response to the client
    return NextResponse.json({
      data: initialData,
      message: "Translation processing started. Check status endpoint for updates.",
    })
  } catch (error) {
    console.error("Error creating translation:", error)
    return NextResponse.json({ error: "Failed to create translation" }, { status: 500 })
  }
}

function mapOrderStateToStatus(state: string): string {
  switch (state) {
    case "incomplete":
    case "waiting_for_payment":
    case "submitted":
    case "free_trial_submitted":
      return "processing"
    case "fulfilled":
    case "free_trial_fulfilled":
      return "success"
    case "failed":
    case "canceled":
    case "expired":
    case "locked":
      return "failed"
    default:
      return "processing"
  }
}
