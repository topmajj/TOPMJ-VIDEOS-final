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
    const { amount, description } = await request.json()

    // Validate input
    if (!amount || amount <= 0 || !description) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // Call the database function to use credits
    const { data, error } = await supabase.rpc("use_credits", {
      p_user_id: session.user.id,
      p_amount: amount,
      p_description: description,
    })

    if (error) {
      console.error("Error using credits:", error)
      return NextResponse.json({ error: "Failed to use credits" }, { status: 500 })
    }

    if (data === false) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Credits used successfully",
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
