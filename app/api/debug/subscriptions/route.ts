import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all subscriptions for debugging
    const { data: allSubscriptions, error: allSubsError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)

    if (allSubsError) {
      console.error("Error fetching all subscriptions:", allSubsError)
      return NextResponse.json({ error: "Failed to fetch all subscriptions" }, { status: 500 })
    }

    // Get active subscription
    const { data: activeSubscription, error: activeSubError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // This is not an error if no subscription is found
    const noActiveSubscription = activeSubError && activeSubError.code === "PGRST116"

    // Check if the subscriptions table exists and has the expected structure
    const { data: tableInfo, error: tableError } = await supabase.rpc("get_table_info", {
      table_name: "subscriptions",
    })

    return NextResponse.json({
      allSubscriptions: allSubscriptions || [],
      activeSubscription: noActiveSubscription ? null : activeSubscription,
      activeSubscriptionError: noActiveSubscription ? null : activeSubError,
      tableExists: !tableError,
      tableInfo: tableInfo || null,
      tableError: tableError ? tableError.message : null,
      userId: session.user.id,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
