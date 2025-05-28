import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log("[SUBSCRIPTIONS API] Fetching subscription")
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    console.log("[SUBSCRIPTIONS API] No session found")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[SUBSCRIPTIONS API] User ID:", session.user.id)

  try {
    // Check if subscriptions table exists
    console.log("[SUBSCRIPTIONS API] Checking if subscriptions table exists")
    const { error: tableCheckError } = await supabase.from("subscriptions").select("id").limit(1)

    // If table doesn't exist or there's another issue, return empty subscription
    if (tableCheckError) {
      console.error("[SUBSCRIPTIONS API] Subscriptions table may not exist:", tableCheckError.message)
      return NextResponse.json({ subscription: null })
    }

    // Get all subscriptions for debugging
    console.log("[SUBSCRIPTIONS API] Fetching all subscriptions for user")
    const { data: allSubscriptions, error: allSubsError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)

    if (allSubsError) {
      console.error("[SUBSCRIPTIONS API] Error fetching all subscriptions:", allSubsError)
    } else {
      console.log("[SUBSCRIPTIONS API] All subscriptions:", JSON.stringify(allSubscriptions))
    }

    // Get user's active subscription
    console.log("[SUBSCRIPTIONS API] Fetching active subscription")
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 is the error code for no rows returned
        console.log("[SUBSCRIPTIONS API] No active subscription found")
      } else {
        console.error("[SUBSCRIPTIONS API] Error fetching subscription:", error)
        return NextResponse.json({ error: "Failed to fetch subscription", details: error }, { status: 500 })
      }
    } else {
      console.log("[SUBSCRIPTIONS API] Active subscription found:", JSON.stringify(subscription))
    }

    return NextResponse.json({ subscription: subscription || null })
  } catch (error) {
    console.error("[SUBSCRIPTIONS API] Error processing request:", error)
    return NextResponse.json({ subscription: null })
  }
}
