import { NextResponse } from "next/server"

export async function GET() {
  const API_KEY = process.env.HEYGEN_API_KEY

  try {
    // Test the API connection
    const response = await fetch("https://api.heygen.com/v2/avatars", {
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY || "",
      },
    })

    const data = await response.json()

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      apiKeyProvided: !!API_KEY,
      apiKeyLength: API_KEY ? API_KEY.length : 0,
      responseData: data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
        apiKeyProvided: !!API_KEY,
        apiKeyLength: API_KEY ? API_KEY.length : 0,
      },
      { status: 500 },
    )
  }
}
