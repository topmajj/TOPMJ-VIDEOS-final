import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    console.log("Test Fatora API received data:", data)

    // Return a success response with the received data
    return NextResponse.json({
      success: true,
      message: "Test API working",
      receivedData: data,
      url: "https://example.com/test-checkout",
    })
  } catch (error: any) {
    console.error("Test Fatora API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
