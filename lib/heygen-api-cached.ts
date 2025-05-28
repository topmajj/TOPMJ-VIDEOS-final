// Cached version of HeyGen API service
import type { Avatar, Voice, VideoGenerationRequest, VideoStatus } from "./heygen-api"

const API_BASE_URL = "https://api.heygen.com"
const API_KEY = process.env.HEYGEN_API_KEY

// In-memory cache with expiration
const cache: {
  [key: string]: {
    data: any
    expiry: number
  }
} = {}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

async function fetchWithCache<T>(
  url: string,
  options: RequestInit,
  cacheKey: string,
  transform: (data: any) => T,
): Promise<T> {
  // Check if we have a valid cached response
  const now = Date.now()
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return cache[cacheKey].data
  }

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const rawData = await response.json()
    const transformedData = transform(rawData)

    // Cache the result
    cache[cacheKey] = {
      data: transformedData,
      expiry: now + CACHE_DURATION,
    }

    return transformedData
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error
  }
}

// Sample data for fallback
const sampleAvatars: Avatar[] = [
  { avatar_id: "avatar1", name: "Business Woman", thumbnail_url: "/placeholder.svg?height=100&width=100" },
  { avatar_id: "avatar2", name: "Business Man", thumbnail_url: "/placeholder.svg?height=100&width=100" },
  { avatar_id: "avatar3", name: "Casual Presenter", thumbnail_url: "/placeholder.svg?height=100&width=100" },
]

const sampleVoices: Voice[] = [
  { voice_id: "voice1", name: "Emma", language: "English (US)", gender: "Female" },
  { voice_id: "voice2", name: "John", language: "English (US)", gender: "Male" },
  { voice_id: "voice3", name: "Sophie", language: "English (UK)", gender: "Female" },
]

// API functions
export async function listAvatars(useSampleData = false): Promise<Avatar[]> {
  if (useSampleData) {
    return sampleAvatars
  }

  try {
    return await fetchWithCache<Avatar[]>(
      `${API_BASE_URL}/v2/avatars`,
      {
        headers: {
          Accept: "application/json",
          "X-Api-Key": API_KEY || "",
        },
      },
      "avatars",
      (data) => {
        if (data && data.data && Array.isArray(data.data)) {
          return data.data
        }
        console.warn("Unexpected avatar data structure:", data)
        return []
      },
    )
  } catch (error) {
    console.error("Error in listAvatars:", error)
    return sampleAvatars // Return sample data on error
  }
}

export async function listVoices(useSampleData = false): Promise<Voice[]> {
  if (useSampleData) {
    return sampleVoices
  }

  try {
    return await fetchWithCache<Voice[]>(
      `${API_BASE_URL}/v2/voices`,
      {
        headers: {
          Accept: "application/json",
          "X-Api-Key": API_KEY || "",
        },
      },
      "voices",
      (data) => {
        if (data && data.data && Array.isArray(data.data)) {
          return data.data
        }
        console.warn("Unexpected voice data structure:", data)
        return []
      },
    )
  } catch (error) {
    console.error("Error in listVoices:", error)
    return sampleVoices // Return sample data on error
  }
}

export async function generateVideo(request: VideoGenerationRequest): Promise<{ video_id: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/v2/video/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY || "",
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
    // Return a mock video ID for testing
    return { video_id: `mock-${Date.now()}` }
  }
}

export async function getVideoStatus(videoId: string): Promise<VideoStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/video_status.get?video_id=${videoId}`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY || "",
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
    // Return a mock status for testing
    return {
      video_id: videoId,
      status: "processing",
      url: undefined,
      error: undefined,
    }
  }
}
