import { NextResponse } from "next/server"
import { sampleAvatars, sampleTalkingPhotos } from "@/lib/heygen-sample-data"

export const maxDuration = 60 // Maximum allowed duration on Vercel

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    // Get API key from environment variable
    const API_KEY = process.env.HEYGEN_API_KEY || ""

    if (!API_KEY) {
      console.log("API key not configured, returning sample data")
      return NextResponse.json({
        avatars: sampleAvatars,
        talking_photos: sampleTalkingPhotos,
        usingSampleData: true,
        reason: "API key not configured",
        timing: {
          totalTime: `${Date.now() - startTime}ms`,
        },
      })
    }

    console.log("Fetching avatars from HeyGen API...")

    // Make the API request
    const response = await fetch("https://api.heygen.com/v2/avatars", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch avatars: ${response.statusText}`)
    }

    const apiResponse = await response.json()
    console.log("API Response:", JSON.stringify(apiResponse, null, 2))

    // Extract avatars and talking photos from the response
    let avatars = []
    let talkingPhotos = []

    // Check for different possible response structures
    if (apiResponse.data && Array.isArray(apiResponse.data.avatars)) {
      avatars = apiResponse.data.avatars
      console.log(`Found ${avatars.length} avatars in apiResponse.data.avatars`)
    } else if (apiResponse.data && apiResponse.data.data && Array.isArray(apiResponse.data.data.avatars)) {
      avatars = apiResponse.data.data.avatars
      console.log(`Found ${avatars.length} avatars in apiResponse.data.data.avatars`)
    } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
      avatars = apiResponse.data
      console.log(`Found ${avatars.length} avatars in apiResponse.data array`)
    } else if (Array.isArray(apiResponse.avatars)) {
      avatars = apiResponse.avatars
      console.log(`Found ${avatars.length} avatars in apiResponse.avatars`)
    } else if (Array.isArray(apiResponse)) {
      avatars = apiResponse
      console.log(`Found ${avatars.length} avatars in apiResponse array`)
    }

    // Check for talking photos in the response
    if (apiResponse.data && Array.isArray(apiResponse.data.talking_photos)) {
      talkingPhotos = apiResponse.data.talking_photos
      console.log(`Found ${talkingPhotos.length} talking photos in apiResponse.data.talking_photos`)
    } else if (apiResponse.data && apiResponse.data.data && Array.isArray(apiResponse.data.data.talking_photos)) {
      talkingPhotos = apiResponse.data.data.talking_photos
      console.log(`Found ${talkingPhotos.length} talking photos in apiResponse.data.data.talking_photos`)
    } else if (Array.isArray(apiResponse.talking_photos)) {
      talkingPhotos = apiResponse.talking_photos
      console.log(`Found ${talkingPhotos.length} talking photos in apiResponse.talking_photos`)
    }

    // If no avatars or talking photos found in the expected locations, try to find them recursively
    if (avatars.length === 0) {
      avatars = findAvatarsInObject(apiResponse)
      console.log(`Found ${avatars.length} avatars using deep search`)
    }

    if (talkingPhotos.length === 0) {
      talkingPhotos = findTalkingPhotosInObject(apiResponse)
      console.log(`Found ${talkingPhotos.length} talking photos using deep search`)
    }

    const endTime = Date.now()

    if (avatars.length === 0 && talkingPhotos.length === 0) {
      console.log("No avatars or talking photos found in API response, returning sample data")
      return NextResponse.json({
        avatars: sampleAvatars,
        talking_photos: sampleTalkingPhotos,
        usingSampleData: true,
        reason: "No avatars or talking photos found in API response",
        apiResponse,
        timing: {
          totalTime: `${endTime - startTime}ms`,
        },
      })
    }

    console.log(
      `Fetched ${avatars.length} avatars and ${talkingPhotos.length} talking photos in ${endTime - startTime}ms`,
    )

    return NextResponse.json({
      avatars,
      talking_photos: talkingPhotos,
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  } catch (error: any) {
    const endTime = Date.now()
    console.error(`Error fetching avatars (${endTime - startTime}ms):`, error)

    return NextResponse.json({
      avatars: sampleAvatars,
      talking_photos: sampleTalkingPhotos,
      usingSampleData: true,
      reason: error.message || "Failed to fetch avatars",
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  }
}

// Helper function to recursively find avatars in an object
function findAvatarsInObject(obj: any): any[] {
  if (!obj || typeof obj !== "object") return []

  // If it's an array and contains objects with avatar_id, it might be what we're looking for
  if (Array.isArray(obj) && obj.length > 0 && obj[0] && obj[0].avatar_id) {
    return obj
  }

  // Otherwise, search through all properties
  let result: any[] = []
  for (const key in obj) {
    const found = findAvatarsInObject(obj[key])
    if (found.length > 0) {
      result = found
      break
    }
  }
  return result
}

// Helper function to recursively find talking photos in an object
function findTalkingPhotosInObject(obj: any): any[] {
  if (!obj || typeof obj !== "object") return []

  // If it's an array and contains objects with talking_photo_id, it might be what we're looking for
  if (Array.isArray(obj) && obj.length > 0 && obj[0] && obj[0].talking_photo_id) {
    return obj
  }

  // Otherwise, search through all properties
  let result: any[] = []
  for (const key in obj) {
    const found = findTalkingPhotosInObject(obj[key])
    if (found.length > 0) {
      result = found
      break
    }
  }
  return result
}
