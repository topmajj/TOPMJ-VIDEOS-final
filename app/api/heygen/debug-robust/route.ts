import { NextResponse } from "next/server"

export const maxDuration = 29 // Maximum allowed duration on Vercel

export async function GET() {
  const startTime = Date.now()
  const timeoutMs = 25000 // 25 seconds timeout

  try {
    // Only use server-side key
    const apiKey = process.env.HEYGEN_API_KEY || ""

    if (!apiKey) {
      return NextResponse.json({
        error: "No API key found in environment variables",
        serverKeyExists: !!process.env.HEYGEN_API_KEY,
      })
    }

    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    // Create the actual fetch promise
    const fetchPromise = fetch("https://api.heygen.com/v2/avatars", {
      headers: {
        Accept: "application/json",
        "X-Api-Key": apiKey,
      },
    }).then(async (response) => {
      const data = await response.json()
      return {
        status: response.status,
        statusText: response.statusText,
        data: data,
      }
    })

    // Race the fetch against the timeout
    const result = await Promise.race([fetchPromise, timeoutPromise])
    const endTime = Date.now()

    return NextResponse.json({
      success: true,
      totalTime: `${endTime - startTime}ms`,
      apiKeyUsed: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null,
      result: result,
    })
  } catch (error: any) {
    const endTime = Date.now()

    return NextResponse.json(
      {
        success: false,
        totalTime: `${endTime - startTime}ms`,
        error: error.message,
        stack: error.stack,
        serverKeyExists: !!process.env.HEYGEN_API_KEY,
      },
      { status: 500 },
    )
  }
}
