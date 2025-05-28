import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated and is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify admin role (assuming you have a way to check admin status)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Fetch settings
  const { data, error } = await supabase.from("admin_settings").select("*").eq("id", 1).single()

  if (error) {
    console.error("Error fetching admin settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated and is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify admin role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get request body
  const settings = await request.json()

  // Validate required fields
  if (!settings.site_name || !settings.notification_email) {
    return NextResponse.json({ error: "Site name and notification email are required" }, { status: 400 })
  }

  // Update settings
  const { data, error } = await supabase
    .from("admin_settings")
    .update({
      site_name: settings.site_name,
      maintenance_mode: settings.maintenance_mode,
      notification_email: settings.notification_email,
      heygen_api_key: settings.heygen_api_key,
      storage_quota_gb: settings.storage_quota_gb,
    })
    .eq("id", 1)
    .select()
    .single()

  if (error) {
    console.error("Error updating admin settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }

  return NextResponse.json(data)
}
