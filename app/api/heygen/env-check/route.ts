import { NextResponse } from "next/server"

export const maxDuration = 10 // Short timeout for quick response

export async function GET() {
  try {
    // Only check server-side key
    const serverKey = process.env.HEYGEN_API_KEY

    return NextResponse.json({
      serverKeyExists: !!serverKey,
      serverKeyLength: serverKey ? serverKey.length : 0,
      // Return first and last 4 chars of keys for verification without exposing full key
      serverKeyPreview: serverKey
        ? `${serverKey.substring(0, 4)}...${serverKey.substring(serverKey.length - 4)}`
        : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
