import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "HeyGen API key is not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 })
    }

    // Check video status with HeyGen API
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
      },
    })

    const data = await response.json()
    console.log("HeyGen API status response:", data)

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to check video status" }, { status: response.status })
    }

    // Extract status and video_url from the response
    const status = data.data?.status
    const videoUrl = data.data?.video_url

    return NextResponse.json({
      status: status || "unknown",
      video_url: videoUrl,
    })
  } catch (error: any) {
    console.error("Error checking video status:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
