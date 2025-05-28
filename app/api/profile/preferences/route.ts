import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch user preferences
  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", session.user.id).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error, which is fine - user just doesn't have preferences yet
    console.error("Error fetching preferences:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }

  return NextResponse.json({ preferences: data || {} })
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get request body
  const preferences = await request.json()

  // Check if user already has preferences
  const { data: existingPrefs, error: fetchError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching existing preferences:", fetchError)
    return NextResponse.json({ error: "Failed to fetch existing preferences" }, { status: 500 })
  }

  let result

  if (existingPrefs) {
    // Update existing preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id)
      .select()

    if (error) {
      console.error("Error updating preferences:", error)
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
    }

    result = data[0]
  } else {
    // Insert new preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .insert({
        user_id: session.user.id,
        ...preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating preferences:", error)
      return NextResponse.json({ error: "Failed to create preferences" }, { status: 500 })
    }

    result = data[0]
  }

  return NextResponse.json({ preferences: result })
}
