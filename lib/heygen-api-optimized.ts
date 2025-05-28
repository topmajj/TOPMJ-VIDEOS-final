// Optimized HeyGen API service
import type { Avatar, Voice, VideoGenerationRequest, VideoStatus } from "./heygen-api"

const API_BASE_URL = "https://api.heygen.com"

// Only use server-side key - never expose in client
function getApiKey() {
  // Remove client-side key reference
  return process.env.HEYGEN_API_KEY || ""
}

// In-memory cache with expiration
const cache: {
  [key: string]: {
    data: any
    expiry: number
  }
} = {}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// API functions
export async function listAvatars(): Promise<Avatar[]> {
  // Check cache first
  const cacheKey = "avatars"
  const now = Date.now()
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return cache[cacheKey].data
  }

  try {
    console.log("Fetching avatars from HeyGen API...")
    const API_KEY = getApiKey()

    if (!API_KEY) {
      console.error("No API key available")
      throw new Error("API key not configured")
    }

    const response = await fetch(`${API_BASE_URL}/v2/avatars`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch avatars: ${response.statusText}`)
    }

    const data = await response.json()

    // Check if data.data exists and is an array
    if (data && data.data && Array.isArray(data.data)) {
      // Cache the result
      cache[cacheKey] = {
        data: data.data,
        expiry: now + CACHE_DURATION,
      }

      return data.data
    }

    // Return empty array if data structure is not as expected
    console.warn("Unexpected avatar data structure:", data)
    return []
  } catch (error) {
    console.error("Error in listAvatars:", error)
    throw error // Re-throw to handle in the route handler
  }
}

export async function listVoices(): Promise<Voice[]> {
  // Check cache first
  const cacheKey = "voices"
  const now = Date.now()
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return cache[cacheKey].data
  }

  try {
    console.log("Fetching voices from HeyGen API...")
    const API_KEY = getApiKey()

    if (!API_KEY) {
      console.error("No API key available")
      throw new Error("API key not configured")
    }

    const response = await fetch(`${API_BASE_URL}/v2/voices`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`)
    }

    const data = await response.json()

    // Check if data.data exists and is an array
    if (data && data.data && Array.isArray(data.data)) {
      // Cache the result
      cache[cacheKey] = {
        data: data.data,
        expiry: now + CACHE_DURATION,
      }

      return data.data
    }

    // Return empty array if data structure is not as expected
    console.warn("Unexpected voice data structure:", data)
    return []
  } catch (error) {
    console.error("Error in listVoices:", error)
    throw error // Re-throw to handle in the route handler
  }
}

export async function generateVideo(request: VideoGenerationRequest): Promise<{ video_id: string }> {
  try {
    const API_KEY = getApiKey()

    if (!API_KEY) {
      console.error("No API key available")
      throw new Error("API key not configured")
    }

    const response = await fetch(`${API_BASE_URL}/v2/video/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate video: ${response.statusText}`)
    }

    const data = await response.json()
    return { video_id: data.data.video_id }
  } catch (error) {
    console.error("Error generating video:", error)
    throw error
  }
}

export async function getVideoStatus(videoId: string): Promise<VideoStatus> {
  try {
    const API_KEY = getApiKey()

    if (!API_KEY) {
      console.error("No API key available")
      throw new Error("API key not configured")
    }

    const response = await fetch(`${API_BASE_URL}/v1/video_status.get?video_id=${videoId}`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get video status: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      video_id: videoId,
      status: data.data.status,
      url: data.data.video_url,
      error: data.data.error,
    }
  } catch (error) {
    console.error("Error getting video status:", error)
    throw error
  }
}

// Sample data only used as a last resort
export const sampleAvatars: Avatar[] = [
  { avatar_id: "avatar1", name: "Business Woman", thumbnail_url: "/placeholder.svg?height=100&width=100" },
  { avatar_id: "avatar2", name: "Business Man", thumbnail_url: "/placeholder.svg?height=100&width=100" },
  { avatar_id: "avatar3", name: "Casual Presenter", thumbnail_url: "/placeholder.svg?height=100&width=100" },
]

export const sampleVoices: Voice[] = [
  { voice_id: "voice1", name: "Emma", language: "English (US)", gender: "Female" },
  { voice_id: "voice2", name: "John", language: "English (US)", gender: "Male" },
  { voice_id: "voice3", name: "Sophie", language: "English (UK)", gender: "Female" },
]
