import { NextResponse } from "next/server"

export const maxDuration = 60 // Maximum allowed duration on Vercel

export async function GET() {
  console.log("API route: /api/heygen/debug-raw called")
  const startTime = Date.now()

  try {
    // Get API key from environment variable
    const API_KEY = process.env.HEYGEN_API_KEY || ""

    if (!API_KEY) {
      return NextResponse.json({
        error: "No API key configured",
        apiKeyExists: false,
      })
    }

    console.log("Fetching raw API response...")

    // Make a simple fetch with no timeout
    const response = await fetch("https://api.heygen.com/v2/avatars", {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
      },
    })

    // Get the raw response text first
    const rawText = await response.text()

    // Try to parse it as JSON
    let jsonData = null
    try {
      jsonData = JSON.parse(rawText)
    } catch (e) {
      console.log("Response is not valid JSON")
    }

    const endTime = Date.now()

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      rawResponse: rawText,
      parsedJson: jsonData,
      timing: {
        totalTime: `${endTime - startTime}ms`,
      },
    })
  } catch (error) {
    const endTime = Date.now()
    console.error(`Error in debug-raw route (${endTime - startTime}ms):`, error)

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch from API",
        timing: {
          totalTime: `${endTime - startTime}ms`,
        },
      },
      { status: 500 },
    )
  }
}
