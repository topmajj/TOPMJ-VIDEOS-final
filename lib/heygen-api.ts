// HeyGen API service - No sample data fallback

const API_BASE_URL = "https://api.heygen.com"

// API key handling
function getApiKey() {
  return process.env.HEYGEN_API_KEY || ""
}

// Types
export interface Avatar {
  avatar_id: string
  avatar_name: string
  gender: string
  preview_image_url: string
  preview_video_url?: string
  premium?: boolean
}

export interface TalkingPhoto {
  talking_photo_id: string
  talking_photo_name: string
  preview_image_url: string
}

export interface AvatarsResponse {
  avatars: Avatar[]
  talking_photos: TalkingPhoto[]
}

export interface Voice {
  voice_id: string
  name: string
  language: string
  gender: string
  sample_url?: string
}

export interface VideoGenerationRequest {
  video_inputs: {
    character: {
      type: string
      avatar_id: string
      avatar_style?: string
    }
    voice: {
      type: string
      input_text: string
      voice_id: string
      speed?: number
    }
  }[]
  dimension?: {
    width: number
    height: number
  }
}

export interface VideoStatus {
  video_id: string
  status: "pending" | "processing" | "completed" | "failed"
  url?: string
  error?: string
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
export async function listAvatars(): Promise<{ avatars: Avatar[]; talkingPhotos: TalkingPhoto[] }> {
  // Check cache first
  const cacheKey = "avatars"
  const now = Date.now()
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return cache[cacheKey].data
  }

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

  // Check if data.avatars exists and is an array
  if (data && data.avatars && Array.isArray(data.avatars)) {
    const result = {
      avatars: data.avatars,
      talkingPhotos: data.talking_photos || [],
    }

    // Cache the result
    cache[cacheKey] = {
      data: result,
      expiry: now + CACHE_DURATION,
    }

    return result
  }

  // Return empty arrays if data structure is not as expected
  console.warn("Unexpected avatar data structure:", data)
  throw new Error("Unexpected response format from API")
}

export async function listVoices(): Promise<Voice[]> {
  // Check cache first
  const cacheKey = "voices"
  const now = Date.now()
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return cache[cacheKey].data
  }

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
  throw new Error("Unexpected response format from API")
}

export async function generateVideo(request: VideoGenerationRequest): Promise<{ video_id: string }> {
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
}

export async function getVideoStatus(videoId: string): Promise<VideoStatus> {
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
}
