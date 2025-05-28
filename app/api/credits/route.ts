import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's credits
  const { data: credits, error: creditsError } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (creditsError) {
    console.error("Error fetching credits:", creditsError)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }

  // Get user's transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }

  // Calculate total remaining credits
  const totalCredits = credits.reduce((sum, credit) => {
    const remaining = credit.total - credit.used
    return sum + remaining
  }, 0)

  return NextResponse.json({
    credits,
    transactions,
    totalCredits,
  })
}
