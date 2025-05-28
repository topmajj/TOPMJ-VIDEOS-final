import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getPlanById, getCreditPackById } from "@/lib/stripe"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if Stripe is initialized
  if (!stripe) {
    return NextResponse.json(
      {
        error: "Stripe is not configured. Please check your environment variables and try again.",
      },
      { status: 500 },
    )
  }

  try {
    const { type, id, mode } = await request.json()

    if (!type || !id || !mode) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    if (type !== "plan" && type !== "pack") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (mode !== "subscription" && mode !== "payment") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
    }

    // Get user email directly from the session
    const userEmail = session.user.email

    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    let priceId: string
    let productName: string
    let metadata: any = {}

    if (type === "plan") {
      const plan = getPlanById(id)
      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 })
      }
      priceId = plan.stripePriceId
      productName = plan.name
      metadata = {
        plan_id: id,
        credits: plan.credits.toString(),
        user_id: session.user.id,
      }
    } else {
      const pack = getCreditPackById(id)
      if (!pack) {
        return NextResponse.json({ error: "Credit pack not found" }, { status: 404 })
      }
      priceId = pack.stripePriceId
      productName = pack.name
      metadata = {
        pack_id: id,
        credits: pack.credits.toString(),
        user_id: session.user.id,
      }
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as "subscription" | "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
      metadata,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
