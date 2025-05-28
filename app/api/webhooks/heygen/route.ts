import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    // You might want to verify the webhook signature here

    const payload = await request.json()

    // Process different webhook events
    switch (payload.event) {
      case "video.processed":
        await handleVideoProcessed(payload.data)
        break
      case "avatar.created":
        await handleAvatarCreated(payload.data)
        break
      case "voice.cloned":
        await handleVoiceCloned(payload.data)
        break
      default:
        return NextResponse.json({ error: `Unknown event type: ${payload.event}` }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message || "An error occurred processing the webhook" }, { status: 500 })
  }
}

// Handler functions for different webhook events
async function handleVideoProcessed(data: any) {
  const { error } = await supabaseAdmin
    .from("videos")
    .update({
      status: "completed",
      video_url: data.video_url,
      duration: data.duration,
      thumbnail_url: data.thumbnail_url,
    })
    .eq("id", data.video_id)

  if (error) throw error
}

async function handleAvatarCreated(data: any) {
  const { error } = await supabaseAdmin
    .from("avatars")
    .update({
      status: "ready",
      image_url: data.image_url,
    })
    .eq("id", data.avatar_id)

  if (error) throw error
}

async function handleVoiceCloned(data: any) {
  const { error } = await supabaseAdmin
    .from("voice_clones")
    .update({
      status: "ready",
      duration: data.duration,
    })
    .eq("id", data.voice_id)

  if (error) throw error
}
