import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { getPlanById, getCreditPackById } from "@/lib/stripe"

export async function POST(request: Request) {
  console.log("[STRIPE WEBHOOK] Received webhook event")

  // Check if Stripe is initialized
  if (!stripe) {
    console.error("[STRIPE WEBHOOK] Stripe is not configured")
    return NextResponse.json(
      {
        error: "Stripe is not configured. Please check your environment variables and try again.",
      },
      { status: 500 },
    )
  }

  const body = await request.text()
  const signature = headers().get("Stripe-Signature") as string

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET is not configured")
    return NextResponse.json(
      {
        error: "STRIPE_WEBHOOK_SECRET is not configured. Please check your environment variables.",
      },
      { status: 500 },
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    console.log(`[STRIPE WEBHOOK] Event type: ${event.type}`)
  } catch (error: any) {
    console.error(`[STRIPE WEBHOOK] Error: ${error.message}`)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      console.log("[STRIPE WEBHOOK] Processing checkout.session.completed")
      const session = event.data.object
      console.log("[STRIPE WEBHOOK] Session data:", JSON.stringify(session))

      const metadata = session.metadata
      console.log("[STRIPE WEBHOOK] Metadata:", JSON.stringify(metadata))

      const userId = metadata?.user_id
      console.log("[STRIPE WEBHOOK] User ID:", userId)

      if (!userId) {
        console.error("[STRIPE WEBHOOK] No user ID in metadata")
        return NextResponse.json({ error: "No user ID in metadata" }, { status: 400 })
      }

      // Check if this is a subscription or one-time payment
      if (session.mode === "subscription") {
        console.log("[STRIPE WEBHOOK] Processing subscription")
        console.log("[STRIPE WEBHOOK] Subscription ID:", session.subscription)
        console.log("[STRIPE WEBHOOK] Customer ID:", session.customer)
        console.log("[STRIPE WEBHOOK] Plan ID:", metadata.plan_id)

        // Store the subscription in the database
        const subscriptionData = {
          user_id: userId,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          plan_id: metadata.plan_id,
          status: "active",
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        }

        console.log("[STRIPE WEBHOOK] Inserting subscription:", JSON.stringify(subscriptionData))

        const { data: insertedSub, error: subscriptionError } = await supabase
          .from("subscriptions")
          .insert(subscriptionData)
          .select()

        if (subscriptionError) {
          console.error("[STRIPE WEBHOOK] Error storing subscription:", subscriptionError)
          return NextResponse.json(
            { error: "Failed to store subscription", details: subscriptionError },
            { status: 500 },
          )
        }

        console.log("[STRIPE WEBHOOK] Subscription stored successfully:", JSON.stringify(insertedSub))

        // Add credits for the subscription
        const plan = getPlanById(metadata.plan_id)
        if (plan) {
          console.log("[STRIPE WEBHOOK] Adding credits for plan:", plan.name)

          // Call the purchase_credits function
          const { data, error } = await supabase.rpc("purchase_credits", {
            p_user_id: userId,
            p_plan: plan.name,
            p_amount: plan.credits,
            p_description: `${plan.name} plan subscription credits`,
          })

          if (error) {
            console.error("[STRIPE WEBHOOK] Error adding subscription credits:", error)
            return NextResponse.json({ error: "Failed to add subscription credits", details: error }, { status: 500 })
          }

          console.log("[STRIPE WEBHOOK] Credits added successfully")
        }
      } else if (session.mode === "payment") {
        console.log("[STRIPE WEBHOOK] Processing one-time payment")

        // One-time payment for credit pack
        const pack = getCreditPackById(metadata.pack_id)
        if (pack) {
          console.log("[STRIPE WEBHOOK] Adding credits for pack:", pack.name)

          // Call the purchase_credits function
          const { data, error } = await supabase.rpc("purchase_credits", {
            p_user_id: userId,
            p_plan: pack.name,
            p_amount: pack.credits,
            p_description: `${pack.name} credit pack purchase`,
          })

          if (error) {
            console.error("[STRIPE WEBHOOK] Error adding credit pack:", error)
            return NextResponse.json({ error: "Failed to add credit pack", details: error }, { status: 500 })
          }

          console.log("[STRIPE WEBHOOK] Credits added successfully")
        }
      }

      break
    }
    case "invoice.payment_succeeded": {
      console.log("[STRIPE WEBHOOK] Processing invoice.payment_succeeded")
      const invoice = event.data.object
      const subscriptionId = invoice.subscription

      if (!subscriptionId) {
        console.log("[STRIPE WEBHOOK] No subscription ID in invoice")
        break
      }

      console.log("[STRIPE WEBHOOK] Subscription ID:", subscriptionId)

      // Get the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
      console.log("[STRIPE WEBHOOK] Subscription data:", JSON.stringify(subscription))

      const metadata = subscription.metadata
      console.log("[STRIPE WEBHOOK] Metadata:", JSON.stringify(metadata))

      const userId = metadata?.user_id
      console.log("[STRIPE WEBHOOK] User ID from metadata:", userId)

      if (!userId) {
        console.log("[STRIPE WEBHOOK] No user ID in metadata, looking up in database")

        // Try to get the user ID from our database
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("user_id, plan_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single()

        if (subscriptionError || !subscriptionData) {
          console.error("[STRIPE WEBHOOK] Error fetching subscription:", subscriptionError)
          break
        }

        console.log("[STRIPE WEBHOOK] Found subscription in database:", JSON.stringify(subscriptionData))

        // Add credits for the subscription renewal
        const plan = getPlanById(subscriptionData.plan_id)
        if (plan) {
          console.log("[STRIPE WEBHOOK] Adding renewal credits for plan:", plan.name)

          // Call the purchase_credits function
          const { data, error } = await supabase.rpc("purchase_credits", {
            p_user_id: subscriptionData.user_id,
            p_plan: plan.name,
            p_amount: plan.credits,
            p_description: `${plan.name} plan subscription renewal`,
          })

          if (error) {
            console.error("[STRIPE WEBHOOK] Error adding renewal credits:", error)
            return NextResponse.json({ error: "Failed to add renewal credits", details: error }, { status: 500 })
          }

          console.log("[STRIPE WEBHOOK] Renewal credits added successfully")
        }

        // Update the subscription's current period end
        const updateData = {
          current_period_end: subscription.current_period_end,
          status: subscription.status,
        }

        console.log("[STRIPE WEBHOOK] Updating subscription:", JSON.stringify(updateData))

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", subscriptionId)

        if (updateError) {
          console.error("[STRIPE WEBHOOK] Error updating subscription:", updateError)
        } else {
          console.log("[STRIPE WEBHOOK] Subscription updated successfully")
        }
      }
      break
    }
    case "customer.subscription.deleted": {
      console.log("[STRIPE WEBHOOK] Processing customer.subscription.deleted")
      const subscription = event.data.object
      console.log("[STRIPE WEBHOOK] Subscription ID:", subscription.id)

      // Update the subscription status in our database
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id)

      if (error) {
        console.error("[STRIPE WEBHOOK] Error updating subscription status:", error)
        return NextResponse.json({ error: "Failed to update subscription status", details: error }, { status: 500 })
      }

      console.log("[STRIPE WEBHOOK] Subscription status updated to canceled")
      break
    }
    default:
      console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`)
  }

  console.log("[STRIPE WEBHOOK] Processing completed successfully")
  return NextResponse.json({ received: true })
}
