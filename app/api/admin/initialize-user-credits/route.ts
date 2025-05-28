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
    const { userId } = await request.json()

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user already has credits
    const { data: existingCredits, error: checkError } = await supabase
      .from("credits")
      .select("id")
      .eq("user_id", userId)
      .limit(1)

    if (checkError) {
      console.error("Error checking existing credits:", checkError)
      return NextResponse.json({ error: "Failed to check existing credits" }, { status: 500 })
    }

    // If user already has credits, don't add more
    if (existingCredits && existingCredits.length > 0) {
      return NextResponse.json({
        success: true,
        message: "User already has credits",
        skipped: true,
      })
    }

    // Add welcome bonus credits
    const { data: creditId, error: creditError } = await supabase
      .from("credits")
      .insert({
        user_id: userId,
        plan: "Welcome",
        total: 100,
        used: 0,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single()

    if (creditError) {
      console.error("Error adding welcome credits:", creditError)
      return NextResponse.json({ error: "Failed to add welcome credits" }, { status: 500 })
    }

    // Record the transaction
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: userId,
      amount: 100,
      description: "Welcome bonus credits",
      type: "bonus",
      reference_id: creditId.id,
    })

    if (transactionError) {
      console.error("Error recording transaction:", transactionError)
      return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Welcome credits added successfully",
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
