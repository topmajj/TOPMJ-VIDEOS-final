import { NextResponse } from "next/server"
import { sampleAvatars, sampleTalkingPhotos, sampleVoices } from "@/lib/heygen-sample-data"

export const maxDuration = 60 // Maximum allowed duration on Vercel

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint parameter is required" }, { status: 400 })
  }

  const startTime = Date.now()
  console.log(`Direct proxy called for endpoint: ${endpoint}`)

  try {
    // Get API key from environment variable
    const API_KEY = process.env.HEYGEN_API_KEY || ""

    if (!API_KEY) {
      console.log("No API key configured, returning sample data")
      return fallbackResponse(endpoint, startTime)
    }

    console.log(`Attempting to fetch from ${endpoint} with no timeout...`)

    // Make a simple fetch with no timeout
    const response = await fetch(`https://api.heygen.com${endpoint}`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
      // No AbortController or timeout
    })

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const endTime = Date.now()

    console.log(`Successfully proxied request in ${endTime - startTime}ms`)

    return NextResponse.json({
      data,
      usingSampleData: false,
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  } catch (error) {
    const endTime = Date.now()
    console.error(`Error in direct proxy (${endTime - startTime}ms):`, error)

    return fallbackResponse(endpoint, startTime, error)
  }
}

// Helper function to return appropriate sample data
function fallbackResponse(endpoint: string, startTime: number, error?: any) {
  const endTime = Date.now()

  // Return appropriate sample data based on the endpoint
  if (endpoint.includes("/avatars")) {
    return NextResponse.json({
      data: { avatars: sampleAvatars, talking_photos: sampleTalkingPhotos },
      usingSampleData: true,
      error: error?.message,
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  } else if (endpoint.includes("/voices")) {
    return NextResponse.json({
      data: { data: sampleVoices },
      usingSampleData: true,
      error: error?.message,
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  }

  // Generic sample data for other endpoints
  return NextResponse.json({
    data: { message: "Sample data - API request failed" },
    usingSampleData: true,
    error: error?.message,
    timing: {
      totalTime: `${endTime - startTime}ms`,
    },
  })
}
