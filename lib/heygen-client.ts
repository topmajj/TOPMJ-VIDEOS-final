// HeyGen API client with shorter timeouts
const API_BASE_URL = "https://api.heygen.com"

// Get API key from environment variable
function getApiKey() {
  return process.env.HEYGEN_API_KEY || ""
}

// API functions
export const heygenClient = {
  // List avatars with a shorter timeout
  async listAvatars() {
    console.log("Fetching avatars from HeyGen API...")
    const API_KEY = getApiKey()

    if (!API_KEY) {
      throw new Error("API key not configured")
    }

    // Use AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/v2/avatars`, {
        headers: {
          Accept: "application/json",
          "X-Api-Key": API_KEY,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        avatars: data.avatars || [],
        talking_photos: data.talking_photos || [],
      }
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out after 8 seconds")
      }
      throw error
    }
  },

  // List voices
  async listVoices() {
    console.log("Fetching voices from HeyGen API...")
    const API_KEY = getApiKey()

    if (!API_KEY) {
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

    return data.data || []
  },

  // Generate video
  async generateVideo(request: VideoGenerationRequest) {
    const API_KEY = getApiKey()

    if (!API_KEY) {
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
  },

  // Get video status
  async getVideoStatus(videoId) {
    const API_KEY = getApiKey()

    if (!API_KEY) {
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
  },
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
