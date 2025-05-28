import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// Handle GET requests
export async function GET(req: Request) {
  // Extract parameters from query string
  const url = new URL(req.url)
  const userId = url.searchParams.get("userId") || "test-user"
  const userEmail = url.searchParams.get("userEmail") || "test@example.com"
  const planName = url.searchParams.get("planName") || "Test Plan"
  const orderId = url.searchParams.get("orderId") || `order_${Date.now()}_${userId.substring(0, 8)}`
  const amountStr = url.searchParams.get("amount") || "19.99"
  const amount = Number.parseFloat(amountStr)

  return handleFatoraTest({ userId, userEmail, planName, orderId, amount })
}

// Handle POST requests
export async function POST(req: Request) {
  try {
    // Extract parameters from request body
    const { userId, userEmail, planName, orderId, amount } = await req.json()
    return handleFatoraTest({ userId, userEmail, planName, orderId, amount })
  } catch (error: any) {
    logger.error(`Test Fatora error parsing request: ${error.message}`)
    return handleFatoraTest({}) // Use defaults if parsing fails
  }
}

// Shared handler for both GET and POST
async function handleFatoraTest({
  userId = "test-user",
  userEmail = "test@example.com",
  planName = "Test Plan",
  orderId = "",
  amount = 19.99,
}) {
  try {
    logger.info(`Received test curl request for user ${userId}, plan ${planName}`)

    if (!process.env.FATORA_API_KEY) {
      logger.error("FATORA_API_KEY environment variable is not set")
      return NextResponse.json({ error: "Fatora API key is not configured" }, { status: 500 })
    }

    // Generate a unique order ID if not provided
    const finalOrderId = orderId || `order_${Date.now()}_${userId.substring(0, 8)}`

    // Create the exact payload that works in the curl command
    const payload = {
      amount: amount,
      currency: "USD",
      order_id: finalOrderId,
      client: {
        name: "User",
        phone: "+9740000000000",
        email: userEmail,
      },
      language: "en",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://videos.topmaj.com"}/dashboard/credits?success=true&provider=fatora&order_id=${finalOrderId}`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://videos.topmaj.com"}/dashboard/credits?canceled=true&provider=fatora`,
      save_token: false,
      note: `Subscription to ${planName} plan`,
    }

    logger.info(`Testing Fatora with curl-like payload: ${JSON.stringify(payload)}`)
    console.log("TEST PAYLOAD BEING SENT TO FATORA:", JSON.stringify(payload, null, 2))

    const response = await fetch("https://api.fatora.io/v1/payments/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: process.env.FATORA_API_KEY,
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

    logger.info(`Test Fatora response status: ${response.status}`)
    console.log("TEST FATORA RESPONSE:", responseData)

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      requestPayload: payload,
    })
  } catch (error: any) {
    logger.error(`Test Fatora error: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
