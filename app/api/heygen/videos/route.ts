import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const maxDuration = 60 // Maximum allowed duration on Vercel

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Get API key from environment variable
    const API_KEY = process.env.HEYGEN_API_KEY || ""

    if (!API_KEY) {
      return NextResponse.json(
        {
          error: "API key not configured",
          timing: {
            totalTime: `${Date.now() - startTime}ms`,
          },
        },
        { status: 500 },
      )
    }

    // Validate required fields
    if (!body.avatar_id) {
      return NextResponse.json({ error: "avatar_id is required" }, { status: 400 })
    }

    if (!body.voice_id) {
      return NextResponse.json({ error: "voice_id is required" }, { status: 400 })
    }

    if (!body.script) {
      return NextResponse.json({ error: "script is required" }, { status: 400 })
    }

    // Prepare the request body according to HeyGen API docs
    const videoRequest = {
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: body.avatar_id,
            avatar_style: body.avatar_style || "normal",
          },
          voice: {
            type: "text",
            input_text: body.script,
            voice_id: body.voice_id,
            speed: body.speed || 1.0,
          },
        },
      ],
      dimension: {
        width: 1280,
        height: 720,
      },
    }

    console.log("Sending video generation request to HeyGen API...")

    // Make the API request
    const response = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
      },
      body: JSON.stringify(videoRequest),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("HeyGen API error:", errorData)
      throw new Error(errorData.error || `Failed to generate video: ${response.statusText}`)
    }

    const data = await response.json()
    const endTime = Date.now()

    console.log(`Generated video in ${endTime - startTime}ms, video_id: ${data.data.video_id}`)

    // Get the user ID from the session using the route handler client
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    if (!userId) {
      console.warn("No user ID found in session, cannot create video without user association")
      return NextResponse.json(
        {
          error: "Authentication required to create videos",
          timing: {
            totalTime: `${Date.now() - startTime}ms`,
          },
        },
        { status: 401 },
      )
    }

    // Store in database with error handling
    try {
      // Prepare the video data
      const videoData = {
        heygen_video_id: data.data.video_id,
        title: `Video ${new Date().toLocaleDateString()}`,
        status: "processing",
        avatar_id: body.avatar_id,
        voice_id: body.voice_id,
        script: body.script,
        user_id: userId,
        created_at: new Date().toISOString(),
      }

      console.log("Storing video data in database:", videoData)

      // Insert into database using the same supabase client
      const { data: insertedData, error } = await supabase.from("videos").insert([videoData]).select()

      if (error) {
        console.error("Database error:", error)

        // Return the video_id even if database storage fails
        return NextResponse.json({
          video_id: data.data.video_id,
          warning: "Video created but failed to store in database",
          error: error.message,
          timing: {
            totalTime: `${Date.now() - startTime}ms`,
          },
        })
      }

      return NextResponse.json({
        video_id: data.data.video_id,
        db_id: insertedData[0]?.id,
        timing: {
          totalTime: `${Date.now() - startTime}ms`,
        },
      })
    } catch (dbError: any) {
      console.error("Error storing video in database:", dbError)

      // Return the video_id even if database storage fails
      return NextResponse.json({
        video_id: data.data.video_id,
        warning: "Video created but failed to store in database",
        error: dbError.message,
        timing: {
          totalTime: `${Date.now() - startTime}ms`,
        },
      })
    }
  } catch (error: any) {
    const endTime = Date.now()
    console.error(`Error generating video (${endTime - startTime}ms):`, error)

    return NextResponse.json(
      {
        error: error.message || "Failed to generate video",
        timing: {
          totalTime: `${endTime - startTime}ms`,
        },
      },
      { status: 500 },
    )
  }
}
