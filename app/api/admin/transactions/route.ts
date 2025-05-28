import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user profile to check admin status
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Parse query parameters
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
  const search = url.searchParams.get("search") || ""
  const type = url.searchParams.get("type") || ""

  // Calculate pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Simply fetch all transactions
  let query = supabaseAdmin.from("transactions").select("*", { count: "exact" })

  // Apply filters
  if (search) {
    query = query.or(`description.ilike.%${search}%,reference_id.ilike.%${search}%`)
  }

  if (type) {
    query = query.eq("type", type)
  }

  // Apply sorting
  query = query.order("created_at", { ascending: false })

  // Apply pagination
  query = query.range(from, to)

  // Execute query
  const { data: transactions, count, error } = await query

  if (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    transactions,
    total: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  })
}
