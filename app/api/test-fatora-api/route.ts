import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    // Create a simple payload that should work
    const payload = {
      amount: 10,
      currency: "USD",
      order_id: `test_${Date.now()}`,
      client: {
        name: "client", // Use the example value from the documentation
        phone: "+9740000000000",
        email: "test@example.com",
      },
      language: "en",
      success_url: "https://example.com/success",
      failure_url: "https://example.com/failure",
      save_token: false,
      note: "Test payment",
    }

    console.log("TEST PAYLOAD:", JSON.stringify(payload, null, 2))

    const response = await fetch("https://api.fatora.io/v1/payments/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: process.env.FATORA_API_KEY || "",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("TEST ERROR:", response.status, errorText)
      return NextResponse.json({ error: `Fatora API error: ${response.status} ${errorText}` }, { status: 500 })
    }

    const data = await response.json()
    console.log("TEST RESPONSE:", JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("TEST EXCEPTION:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
