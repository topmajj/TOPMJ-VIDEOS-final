import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const { userId, planName, credits, orderId, transactionId: fatoraTransactionId } = await req.json()

    console.log(`Processing Fatora success for user ${userId}, plan ${planName}`)

    if (!userId || !planName || !credits || !orderId) {
      console.error("Missing required fields in success request")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate expiration date (30 days from now)
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(now.getDate() + 30)

    // Format dates in the exact format from the SQL file
    const nowStr = now.toISOString().replace("Z", "+00")
    const expiresAtStr = expiresAt.toISOString().replace("Z", "+00")

    // Create a credit record using supabaseAdmin to bypass RLS
    const creditId = uuidv4()

    // Log the credit record we're trying to create
    console.log("Creating credit record with admin client:", {
      id: creditId,
      user_id: userId,
      plan: planName,
      total: credits.toString(),
      used: "0",
      expires_at: expiresAtStr,
      created_at: nowStr,
      updated_at: nowStr,
    })

    const { error: creditError } = await supabaseAdmin.from("credits").insert({
      id: creditId,
      user_id: userId,
      plan: planName,
      total: credits.toString(),
      used: "0",
      expires_at: expiresAtStr,
      created_at: nowStr,
      updated_at: nowStr,
    })

    if (creditError) {
      console.error(`Failed to create credit record: ${JSON.stringify(creditError)}`)
      return NextResponse.json({ error: "Failed to create credit record", details: creditError }, { status: 500 })
    }

    // Create a transaction record using supabaseAdmin to bypass RLS
    const transactionId = uuidv4()

    // Log the transaction record we're trying to create
    console.log("Creating transaction record with admin client:", {
      id: transactionId,
      user_id: userId,
      amount: credits.toString(),
      description: `${planName} credit pack purchase`,
      type: "purchase",
      reference_id: creditId,
      created_at: nowStr,
    })

    const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
      id: transactionId,
      user_id: userId,
      amount: credits.toString(),
      description: `${planName} credit pack purchase`,
      type: "purchase",
      reference_id: creditId,
      created_at: nowStr,
    })

    if (transactionError) {
      console.error(`Failed to create transaction record: ${JSON.stringify(transactionError)}`)
      return NextResponse.json(
        { error: "Failed to create transaction record", details: transactionError },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, creditId, transactionId })
  } catch (error: any) {
    console.error(`Error processing Fatora success: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
