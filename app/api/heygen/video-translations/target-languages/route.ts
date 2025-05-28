import { NextResponse } from "next/server"

// Fallback languages to use when the API is not accessible
const FALLBACK_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
]

export async function GET() {
  try {
    console.log("Fetching supported languages for video translation...")

    const apiKey = process.env.HEYGEN_API_KEY
    if (!apiKey) {
      console.error("HEYGEN_API_KEY is not defined")
      return NextResponse.json({
        data: { languages: FALLBACK_LANGUAGES },
        note: "Using fallback languages because API key is not configured",
      })
    }

    const response = await fetch("https://api.heygen.com/v2/video_translate/target_languages", {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    })

    // If we get a 403, it means the API key doesn't have access to this feature
    if (response.status === 403) {
      console.warn("403 Forbidden: Your API key doesn't have access to the Video Translation feature")
      return NextResponse.json({
        data: { languages: FALLBACK_LANGUAGES },
        note: "Using fallback languages because your API key doesn't have access to the Video Translation feature (requires Scale or Enterprise tier)",
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error response from HeyGen API:", errorData)

      // Return fallback languages with a note
      return NextResponse.json({
        data: { languages: FALLBACK_LANGUAGES },
        note: `Using fallback languages due to API error: ${response.status} ${response.statusText}`,
      })
    }

    const data = await response.json()
    console.log("Supported languages response:", data)

    // Return the actual languages if available, otherwise fallback
    if (data.data && Array.isArray(data.data.languages) && data.data.languages.length > 0) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json({
        data: { languages: FALLBACK_LANGUAGES },
        note: "Using fallback languages because the API didn't return any languages",
      })
    }
  } catch (error) {
    console.error("Error fetching supported languages:", error)
    return NextResponse.json({
      data: { languages: FALLBACK_LANGUAGES },
      note: "Using fallback languages due to an error",
    })
  }
}
