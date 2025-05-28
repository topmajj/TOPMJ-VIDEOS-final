import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    // First, let's check if the credits table exists and what columns it has
    const { data, error } = await supabase.rpc("get_table_info", { table_name: "credits" })

    if (error) {
      console.error(`Error checking credits table: ${JSON.stringify(error)}`)
      return NextResponse.json({ error: "Failed to check credits table", details: error }, { status: 500 })
    }

    return NextResponse.json({ tableInfo: data })
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
