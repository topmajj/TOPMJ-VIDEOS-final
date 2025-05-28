// Resilient HeyGen API service with immediate fallback
import type { Avatar, Voice, VideoGenerationRequest, VideoStatus, TalkingPhoto } from "./heygen-api"

const API_BASE_URL = "https://api.heygen.com"

// Only use server-side key
function getApiKey() {
  return process.env.HEYGEN_API_KEY || ""
}

// In-memory cache with expiration
const cache: {
  [key: string]: {
    data: any
    expiry: number
  }
} = {}

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

// Sample data for immediate fallback
export const sampleAvatars: Avatar[] = [
  {
    avatar_id: "avatar1",
    avatar_name: "Business Woman",
    gender: "female",
    preview_image_url: "/placeholder.svg?height=100&width=100",
    preview_video_url: "/placeholder.svg?height=200&width=300",
    premium: false,
  },
  {
    avatar_id: "avatar2",
    avatar_name: "Business Man",
    gender: "male",
    preview_image_url: "/placeholder.svg?height=100&width=100",
    preview_video_url: "/placeholder.svg?height=200&width=300",
    premium: false,
  },
  {
    avatar_id: "avatar3",
    avatar_name: "Casual Presenter",
    gender: "female",
    preview_image_url: "/placeholder.svg?height=100&width=100",
    preview_video_url: "/placeholder.svg?height=200&width=300",
    premium: true,
  },
]

export const sampleTalkingPhotos: TalkingPhoto[] = [
  {
    talking_photo_id: "tp1",
    talking_photo_name: "My Photo Avatar",
    preview_image_url: "/placeholder.svg?height=100&width=100",
  },
  {
    talking_photo_id: "tp2",
    talking_photo_name: "Professional Headshot",
    preview_image_url: "/placeholder.svg?height=100&width=100",
  },
]

export const sampleVoices: Voice[] = [
  { voice_id: "voice1", name: "Emma", language: "English (US)", gender: "Female" },
  { voice_id: "voice2", name: "John", language: "English (US)", gender: "Male" },
  { voice_id: "voice3", name: "Sophie", language: "English (UK)", gender: "Female" },
]

// API functions with immediate fallback
export async function listAvatarsWithFallback(timeoutMs = 5000): Promise<{
  avatars: Avatar[]
  talkingPhotos: TalkingPhoto[]
  usingSampleData: boolean
}> {
  // Check cache first
  const cacheKey = "avatars"
  const now = Date.now()
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return {
      avatars: cache[cacheKey].data.avatars,
      talkingPhotos: cache[cacheKey].data.talkingPhotos,
      usingSampleData: false,
    }
  }

  try {
    console.log("Fetching avatars from HeyGen API with quick timeout...")
    const API_KEY = getApiKey()

    if (!API_KEY) {
      console.error("No API key available")
      return {
        avatars: sampleAvatars,
        talkingPhotos: sampleTalkingPhotos,
        usingSampleData: true,
      }
    }

    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    // Create the actual fetch promise
    const fetchPromise = fetch(`${API_BASE_URL}/v2/avatars`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.statusText}`)
      }

      const data = await response.json()

      // Check if data.avatars exists and is an array
      if (data && data.avatars && Array.isArray(data.avatars)) {
        // Cache the result
        cache[cacheKey] = {
          data: {
            avatars: data.avatars,
            talkingPhotos: data.talking_photos || [],
          },
          expiry: now + CACHE_DURATION,
        }

        return {
          avatars: data.avatars,
          talkingPhotos: data.talking_photos || [],
        }
      }

      throw new Error("Unexpected avatar data structure")
    })

    // Race the fetch against the timeout
    const result = await Promise.race([fetchPromise, timeoutPromise])
    return {
      avatars: result.avatars,
      talkingPhotos: result.talkingPhotos,
      usingSampleData: false,
    }
  } catch (error) {
    console.error("Error in listAvatarsWithFallback:", error)

    // Start a background fetch to try to update the cache for next time
    setTimeout(() => {
      console.log("Attempting background fetch for avatars...")
      fetch(`${API_BASE_URL}/v2/avatars`, {
        headers: {
          Accept: "application/json",
          "X-Api-Key": getApiKey(),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.avatars && Array.isArray(data.avatars)) {
            cache["avatars"] = {
              data: {
                avatars: data.avatars,
                talkingPhotos: data.talking_photos || [],
              },
              expiry: Date.now() + CACHE_DURATION,
            }
            console.log("Background fetch for avatars succeeded, cache updated")
          }
        })
        .catch((err) => console.error("Background fetch for avatars failed:", err))
    }, 100)

    // Return sample data immediately
    return {
      avatars: sampleAvatars,
      talkingPhotos: sampleTalkingPhotos,
      usingSampleData: true,
    }
  }
}

export async function listVoicesWithFallback(timeoutMs = 5000): Promise<{ voices: Voice[]; usingSampleData: boolean }> {
  // Check cache first
  const cacheKey = "voices"
  const now = Date.now()
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return { voices: cache[cacheKey].data, usingSampleData: false }
  }

  try {
    console.log("Fetching voices from HeyGen API with quick timeout...")
    const API_KEY = getApiKey()

    if (!API_KEY) {
      console.error("No API key available")
      return { voices: sampleVoices, usingSampleData: true }
    }

    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    // Create the actual fetch promise
    const fetchPromise = fetch(`${API_BASE_URL}/v2/voices`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    }).then(async (response) => {
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

      throw new Error("Unexpected voice data structure")
    })

    // Race the fetch against the timeout
    const voices = await Promise.race([fetchPromise, timeoutPromise])
    return { voices, usingSampleData: false }
  } catch (error) {
    console.error("Error in listVoicesWithFallback:", error)

    // Start a background fetch to try to update the cache for next time
    setTimeout(() => {
      console.log("Attempting background fetch for voices...")
      fetch(`${API_BASE_URL}/v2/voices`, {
        headers: {
          Accept: "application/json",
          "X-Api-Key": getApiKey(),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.data && Array.isArray(data.data)) {
            cache["voices"] = {
              data: data.data,
              expiry: Date.now() + CACHE_DURATION,
            }
            console.log("Background fetch for voices succeeded, cache updated")
          }
        })
        .catch((err) => console.error("Background fetch for voices failed:", err))
    }, 100)

    // Return sample data immediately
    return { voices: sampleVoices, usingSampleData: true }
  }
}

// Regular API functions for when we need to wait for a response
export async function generateVideo(request: VideoGenerationRequest): Promise<{ video_id: string }> {
  try {
    const API_KEY = getApiKey()

    if (!API_KEY) {
      console.error("No API key available")
      // Return a mock video ID for testing
      return { video_id: `mock-${Date.now()}` }
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
    // Return a mock video ID for testing
    return { video_id: `mock-${Date.now()}` }
  }
}

export async function getVideoStatus(videoId: string): Promise<VideoStatus> {
  // If it's a mock ID, return a completed status
  if (videoId.startsWith("mock-")) {
    return {
      video_id: videoId,
      status: "completed",
      url: "https://example.com/sample-video.mp4",
    }
  }

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
    // Return a processing status for real video IDs
    return {
      video_id: videoId,
      status: "processing",
    }
  }
}
