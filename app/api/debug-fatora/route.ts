import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    logger.info(`Debug Fatora API call with payload: ${JSON.stringify(payload)}`)
    console.log("DEBUG FATORA PAYLOAD:", JSON.stringify(payload, null, 2))

    // Make a direct API call to Fatora
    const response = await fetch("https://api.fatora.io/v1/payments/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: process.env.FATORA_API_KEY || "",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { text: responseText }
    }

    logger.info(`Debug Fatora API response: ${JSON.stringify(responseData)}`)
    console.log("DEBUG FATORA RESPONSE:", response.status, JSON.stringify(responseData, null, 2))

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
    })
  } catch (error: any) {
    logger.error(`Debug Fatora API error: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
