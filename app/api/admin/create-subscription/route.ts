import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    // Create a test subscription
    const subscriptionData = {
      user_id: session.user.id,
      stripe_subscription_id: `test_sub_${Date.now()}`,
      stripe_customer_id: `test_cus_${Date.now()}`,
      plan_id: planId,
      status: "active",
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    }

    const { data, error } = await supabase.from("subscriptions").insert(subscriptionData).select()

    if (error) {
      return NextResponse.json({ error: "Failed to create subscription", details: error }, { status: 500 })
    }

    return NextResponse.json({ subscription: data[0] })
  } catch (error) {
    console.error("Error creating test subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
