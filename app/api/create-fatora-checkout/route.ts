import { NextResponse } from "next/server"
import { createFatoraCheckoutSession } from "@/lib/fatora"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const { userId, userEmail, planName, orderId, amount } = await req.json()

    logger.info(`Received checkout request for user ${userId}, plan ${planName}`)

    if (!userId || !userEmail || !planName) {
      logger.error("Missing required fields in checkout request")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if FATORA_API_KEY is set
    if (!process.env.FATORA_API_KEY) {
      logger.error("FATORA_API_KEY environment variable is not set")
      return NextResponse.json({ error: "Fatora API key is not configured" }, { status: 500 })
    }

    // Generate a unique order ID if not provided
    const finalOrderId = orderId || `order_${Date.now()}_${userId.substring(0, 8)}`

    // Calculate amount based on plan
    let finalAmount = amount
    if (!finalAmount) {
      if (planName === "Small Pack") {
        finalAmount = 4.99
      } else if (planName === "Medium Pack") {
        finalAmount = 19.99
      } else if (planName === "Large Pack") {
        finalAmount = 34.99
      } else if (planName === "Extra Large Pack") {
        finalAmount = 74.99
      } else if (planName === "Pro") {
        finalAmount = 29
      } else if (planName === "Business") {
        finalAmount = 99
      }
    }

    try {
      // Create checkout session with the exact format that works in the curl command
      const checkoutUrl = await createFatoraCheckoutSession({
        amount: finalAmount,
        orderId: finalOrderId,
        customerEmail: userEmail,
        customerPhone: "+9740000000000", // Placeholder phone number
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true&provider=fatora&order_id=${finalOrderId}`,
        errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true&provider=fatora`,
        note: `Subscription to ${planName} plan`,
      })

      // Log the checkout URL for debugging
      logger.info(`Created Fatora checkout URL: ${checkoutUrl}`)

      return NextResponse.json({ url: checkoutUrl })
    } catch (checkoutError: any) {
      logger.error(`Error creating Fatora checkout: ${checkoutError.message}`)
      return NextResponse.json(
        { error: "Failed to create checkout session", details: checkoutError.message },
        { status: 500 },
      )
    }
  } catch (error: any) {
    logger.error(`Fatora checkout error: ${error.message}`)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
