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
    const { plan, amount } = await request.json()

    // Validate input
    if (!plan || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // In a real application, you would process payment here
    // For demo purposes, we'll just add the credits

    // Start a transaction
    const { data, error } = await supabase.rpc("purchase_credits", {
      p_user_id: session.user.id,
      p_plan: plan,
      p_amount: amount,
      p_description: `${plan} plan credits purchase`,
    })

    if (error) {
      console.error("Error purchasing credits:", error)
      return NextResponse.json({ error: "Failed to purchase credits" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Credits purchased successfully",
      data,
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
