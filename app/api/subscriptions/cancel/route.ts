import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

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
    // Get user's active subscription
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .single()

    if (error) {
      console.error("Error fetching subscription:", error)
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id)

    // Update the subscription status in our database
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscription.stripe_subscription_id)

    if (updateError) {
      console.error("Error updating subscription status:", updateError)
      return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Subscription canceled successfully" })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
