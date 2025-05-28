import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { videoId, heygenUrl } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    if (!heygenUrl) {
      return NextResponse.json({ error: "HeyGen URL is required" }, { status: 400 })
    }

    // Get the supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Get the video from the database
    const { data: video, error: videoError } = await supabase.from("videos").select("*").eq("id", videoId).single()

    if (videoError) {
      console.error("Error fetching video:", videoError)
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Fetch the video from HeyGen
    console.log(`Fetching video from HeyGen: ${heygenUrl}`)
    const response = await fetch(heygenUrl)

    if (!response.ok) {
      console.error(`Failed to fetch video: ${response.statusText}`)
      return NextResponse.json({ error: "Failed to fetch video from HeyGen" }, { status: 500 })
    }

    // Get the video as a blob
    const videoBlob = await response.blob()

    // Generate a unique filename
    const filename = `${videoId}-${Date.now()}.mp4`

    // Upload to Supabase Storage
    console.log(`Uploading video to Supabase storage: ${filename}`)
    const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(filename, videoBlob, {
      contentType: "video/mp4",
      cacheControl: "3600",
    })

    if (uploadError) {
      console.error("Error uploading to storage:", uploadError)
      return NextResponse.json({ error: "Failed to upload video to storage" }, { status: 500 })
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("videos").getPublicUrl(filename)

    // Check if supabase_url column exists in the videos table
    try {
      // First, try updating with supabase_url
      const { error: updateError } = await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: heygenUrl,
          supabase_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId)

      if (updateError) {
        console.error("Error updating video record:", updateError)

        // If the error is about the supabase_url column, try updating without it
        if (updateError.message.includes("supabase_url")) {
          console.log("Trying to update without supabase_url column")
          const { error: fallbackUpdateError } = await supabase
            .from("videos")
            .update({
              status: "completed",
              video_url: heygenUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", videoId)

          if (fallbackUpdateError) {
            console.error("Error in fallback update:", fallbackUpdateError)
            return NextResponse.json({ error: "Failed to update video record" }, { status: 500 })
          }
        } else {
          return NextResponse.json({ error: "Failed to update video record" }, { status: 500 })
        }
      }
    } catch (error: any) {
      console.error("Error in update operation:", error)
      return NextResponse.json({ error: error.message || "Failed to update video record" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      supabaseUrl: publicUrl,
      message: "Video saved to storage successfully",
    })
  } catch (error: any) {
    console.error("Error saving video to storage:", error)
    return NextResponse.json({ error: error.message || "Failed to save video to storage" }, { status: 500 })
  }
}
