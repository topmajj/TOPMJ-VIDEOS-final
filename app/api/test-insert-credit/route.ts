import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

export async function GET(req: Request) {
  try {
    // Generate a UUID for the credit record
    const creditId = uuidv4()

    // Use the exact same format as in the SQL file
    const data = {
      id: creditId,
      user_id: "0ece322b-6336-412a-9df3-316d952b7d21", // Use the user's ID from the SQL file
      plan: "Test Pack",
      total: "100", // String, not number
      used: "0", // String, not number
      expires_at: "2025-04-20 18:57:44.519437+00", // Exact format from SQL file
      created_at: "2025-03-21 18:57:44.519437+00", // Exact format from SQL file
      updated_at: "2025-03-21 18:57:44.519437+00", // Exact format from SQL file
    }

    console.log("Inserting test credit record with admin client:", data)

    const { error } = await supabaseAdmin.from("credits").insert(data)

    if (error) {
      console.error("Error inserting test credit record:", error)
      return NextResponse.json({ error: "Failed to insert test credit record", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, creditId })
  } catch (error: any) {
    console.error("Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
