import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "age", "gender", "ethnicity", "orientation", "pose", "style", "appearance"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if user has enough credits
    const { data: creditsData, error: creditsError } = await supabase
      .from("credits")
      .select("total, used")
      .eq("user_id", userId)

    if (creditsError) {
      console.error("Error fetching credits:", creditsError)
      return NextResponse.json({ error: "Failed to fetch credits", details: creditsError }, { status: 500 })
    }

    // Handle case where user might have multiple credit records
    if (!creditsData || creditsData.length === 0) {
      return NextResponse.json({ error: "No credits found for user" }, { status: 400 })
    }

    // Sum up all credits if there are multiple records
    let totalCredits = 0
    let usedCredits = 0
    creditsData.forEach((credit) => {
      totalCredits += credit.total || 0
      usedCredits += credit.used || 0
    })

    const availableCredits = totalCredits - usedCredits
    if (availableCredits < 10) {
      // Assuming 10 credits for avatar generation
      return NextResponse.json({ error: "Insufficient credits. Please purchase more credits." }, { status: 400 })
    }

    // Call HeyGen API to generate avatar
    const heygenApiKey = process.env.HEYGEN_API_KEY
    if (!heygenApiKey) {
      return NextResponse.json({ error: "HeyGen API key not configured" }, { status: 500 })
    }

    console.log("Calling HeyGen API with payload:", {
      name: body.name,
      age: body.age,
      gender: body.gender,
      ethnicity: body.ethnicity,
      orientation: body.orientation,
      pose: body.pose,
      style: body.style,
      appearance: body.appearance,
    })

    const heygenResponse = await fetch("https://api.heygen.com/v2/photo_avatar/photo/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": heygenApiKey,
      },
      body: JSON.stringify({
        name: body.name,
        age: body.age,
        gender: body.gender,
        ethnicity: body.ethnicity,
        orientation: body.orientation,
        pose: body.pose,
        style: body.style,
        appearance: body.appearance,
      }),
    })

    console.log("HeyGen API response status:", heygenResponse.status)

    if (!heygenResponse.ok) {
      let errorText = ""
      try {
        errorText = await heygenResponse.text()
      } catch (e) {
        errorText = "Could not read error response"
      }
      console.error("HeyGen API error:", errorText)
      return NextResponse.json({ error: "Failed to generate avatar", details: errorText }, { status: 500 })
    }

    let heygenData
    try {
      heygenData = await heygenResponse.json()
      console.log("HeyGen API response data:", JSON.stringify(heygenData))
    } catch (e) {
      console.error("Error parsing HeyGen API response:", e)
      return NextResponse.json({ error: "Invalid API response format", details: e }, { status: 500 })
    }

    // Extract generation ID from the response
    let generationId = null
    if (heygenData.data && heygenData.data.generation_id) {
      generationId = heygenData.data.generation_id
    } else if (heygenData.generation_id) {
      generationId = heygenData.generation_id
    } else if (heygenData.data && heygenData.data.id) {
      // Some API versions might return id instead of generation_id
      generationId = heygenData.data.id
    }

    if (!generationId) {
      console.error("No generation ID found in response:", JSON.stringify(heygenData))
      return NextResponse.json(
        { error: "Invalid API response", message: "Could not extract generation ID from API response", heygenData },
        { status: 500 },
      )
    }

    console.log("Extracted generation ID:", generationId)

    // Save avatar to database
    try {
      const { data: photoAvatar, error: insertError } = await supabase
        .from("photo_avatars")
        .insert({
          id: uuidv4(),
          user_id: userId,
          name: body.name,
          age: body.age,
          gender: body.gender,
          ethnicity: body.ethnicity,
          orientation: body.orientation,
          pose: body.pose,
          style: body.style,
          appearance: body.appearance,
          generation_id: generationId,
          status: "processing",
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error inserting photo avatar:", insertError)
        return NextResponse.json({ error: "Failed to save avatar", details: insertError }, { status: 500 })
      }

      console.log("Photo avatar saved to database:", photoAvatar)

      // Use 10 credits for avatar generation
      try {
        const { error: useCreditsError } = await supabase.rpc("use_credits", {
          p_user_id: userId,
          p_amount: 10,
          p_description: "Photo avatar generation",
        })

        if (useCreditsError) {
          console.error("Error using credits:", useCreditsError)
          return NextResponse.json({ error: "Failed to use credits", details: useCreditsError }, { status: 500 })
        }

        console.log("Credits used successfully")

        return NextResponse.json({
          success: true,
          message: "Avatar generation started",
          data: {
            photoAvatarId: photoAvatar.id,
            generationId,
          },
        })
      } catch (creditsError) {
        console.error("Exception when using credits:", creditsError)
        return NextResponse.json({ error: "Exception when using credits", details: creditsError }, { status: 500 })
      }
    } catch (dbError) {
      console.error("Exception when saving to database:", dbError)
      return NextResponse.json({ error: "Exception when saving to database", details: dbError }, { status: 500 })
    }
  } catch (error) {
    console.error("Unhandled error in photo avatar generation:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
