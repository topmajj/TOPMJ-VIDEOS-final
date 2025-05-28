import { NextResponse } from "next/server"
import { sampleVoices } from "@/lib/heygen-sample-data"

export const maxDuration = 60 // Maximum allowed duration on Vercel

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    // Get API key from environment variable
    const API_KEY = process.env.HEYGEN_API_KEY || ""

    if (!API_KEY) {
      console.log("API key not configured, returning sample data")
      return NextResponse.json({
        voices: sampleVoices,
        usingSampleData: true,
        reason: "API key not configured",
        timing: {
          totalTime: `${Date.now() - startTime}ms`,
        },
      })
    }

    console.log("Fetching voices from HeyGen API...")

    // Make the API request
    const response = await fetch("https://api.heygen.com/v2/voices", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`)
    }

    const apiResponse = await response.json()
    console.log("API Response:", JSON.stringify(apiResponse, null, 2))

    // Extract voices from the response
    let voices = []

    // Check for different possible response structures
    if (apiResponse.data && Array.isArray(apiResponse.data.voices)) {
      voices = apiResponse.data.voices
      console.log(`Found ${voices.length} voices in apiResponse.data.voices`)
    } else if (apiResponse.data && apiResponse.data.data && Array.isArray(apiResponse.data.data.voices)) {
      voices = apiResponse.data.data.voices
      console.log(`Found ${voices.length} voices in apiResponse.data.data.voices`)
    } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
      voices = apiResponse.data
      console.log(`Found ${voices.length} voices in apiResponse.data array`)
    } else if (Array.isArray(apiResponse.voices)) {
      voices = apiResponse.voices
      console.log(`Found ${voices.length} voices in apiResponse.voices`)
    } else if (Array.isArray(apiResponse)) {
      voices = apiResponse
      console.log(`Found ${voices.length} voices in apiResponse array`)
    }

    // If no voices found in the expected locations, try to find them recursively
    if (voices.length === 0) {
      voices = findVoicesInObject(apiResponse)
      console.log(`Found ${voices.length} voices using deep search`)
    }

    const endTime = Date.now()

    if (voices.length === 0) {
      console.log("No voices found in API response, returning sample data")
      return NextResponse.json({
        voices: sampleVoices,
        usingSampleData: true,
        reason: "No voices found in API response",
        apiResponse,
        timing: {
          totalTime: `${endTime - startTime}ms`,
        },
      })
    }

    console.log(`Fetched ${voices.length} voices in ${endTime - startTime}ms`)

    return NextResponse.json({
      voices,
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  } catch (error: any) {
    const endTime = Date.now()
    console.error(`Error fetching voices (${endTime - startTime}ms):`, error)

    return NextResponse.json({
      voices: sampleVoices,
      usingSampleData: true,
      reason: error.message || "Failed to fetch voices",
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  }
}

// Helper function to recursively find voices in an object
function findVoicesInObject(obj: any): any[] {
  if (!obj || typeof obj !== "object") return []

  // If it's an array and contains objects with voice_id, it might be what we're looking for
  if (Array.isArray(obj) && obj.length > 0 && obj[0] && obj[0].voice_id) {
    return obj
  }

  // Otherwise, search through all properties
  let result: any[] = []
  for (const key in obj) {
    const found = findVoicesInObject(obj[key])
    if (found.length > 0) {
      result = found
      break
    }
  }
  return result
}
