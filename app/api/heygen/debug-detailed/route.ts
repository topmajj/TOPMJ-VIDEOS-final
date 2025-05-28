import { NextResponse } from "next/server"

export async function GET() {
  const API_KEY = process.env.HEYGEN_API_KEY // Only use server-side env var
  const startTime = Date.now()

  try {
    console.log("Starting detailed debug request...")

    // Test the API connection with timing
    console.log("Fetching avatars...")
    const avatarsStartTime = Date.now()
    const avatarsResponse = await fetch("https://api.heygen.com/v2/avatars", {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY || "",
      },
    })
    const avatarsEndTime = Date.now()
    const avatarsData = await avatarsResponse.json()

    // Test voices endpoint
    console.log("Fetching voices...")
    const voicesStartTime = Date.now()
    const voicesResponse = await fetch("https://api.heygen.com/v2/voices", {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY || "",
      },
    })
    const voicesEndTime = Date.now()
    const voicesData = await voicesResponse.json()

    const endTime = Date.now()

    return NextResponse.json({
      success: true,
      totalTime: `${endTime - startTime}ms`,
      apiKeyProvided: !!API_KEY,
      apiKeyLength: API_KEY ? API_KEY.length : 0,
      avatars: {
        status: avatarsResponse.status,
        statusText: avatarsResponse.statusText,
        time: `${avatarsEndTime - avatarsStartTime}ms`,
        count: avatarsData?.data?.length || 0,
      },
      voices: {
        status: voicesResponse.status,
        statusText: voicesResponse.statusText,
        time: `${voicesEndTime - voicesStartTime}ms`,
        count: voicesData?.data?.length || 0,
      },
    })
  } catch (error: any) {
    const endTime = Date.now()

    return NextResponse.json(
      {
        success: false,
        totalTime: `${endTime - startTime}ms`,
        error: error.message,
        stack: error.stack,
        apiKeyProvided: !!API_KEY,
        apiKeyLength: API_KEY ? API_KEY.length : 0,
      },
      { status: 500 },
    )
  }
}
