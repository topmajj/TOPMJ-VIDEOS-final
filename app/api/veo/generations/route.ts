import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rest of the function remains the same...
    return NextResponse.json({ message: "Generations route" })
  } catch (error) {
    console.error("Error in GET:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
