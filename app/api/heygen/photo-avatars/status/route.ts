import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const generationId = searchParams.get("generationId")
    const photoAvatarId = searchParams.get("photoAvatarId")

    if (!generationId || !photoAvatarId) {
      return NextResponse.json({ error: "Missing generationId or photoAvatarId" }, { status: 400 })
    }

    // Call HeyGen API to check status
    const heygenApiKey = process.env.HEYGEN_API_KEY
    if (!heygenApiKey) {
      return NextResponse.json({ error: "HeyGen API key not configured" }, { status: 500 })
    }

    console.log(`Checking status for generation ID: ${generationId}, photo avatar ID: ${photoAvatarId}`)

    const heygenResponse = await fetch(`https://api.heygen.com/v2/photo_avatar/generation/${generationId}`, {
      method: "GET",
      headers: {
        "X-Api-Key": heygenApiKey,
      },
    })

    console.log(`HeyGen API status response code: ${heygenResponse.status}`)

    if (!heygenResponse.ok) {
      const errorText = await heygenResponse.text()
      console.error("HeyGen API error:", errorText)
      return NextResponse.json({ error: "Failed to check status", details: errorText }, { status: 500 })
    }

    const heygenData = await heygenResponse.json()
    console.log("HeyGen API response data:", JSON.stringify(heygenData))

    // Extract status and photo URL from the response
    let status = "processing"
    let photoUrl = null

    if (heygenData.data) {
      // Handle both "completed" and "success" statuses
      status = heygenData.data.status || "processing"

      // Check for success status which is what the API actually returns
      if (status === "success") {
        status = "completed" // Map "success" to "completed" for our database
      }

      // Check for photo_url (old API) or image_url_list (new API format)
      if (heygenData.data.photo_url) {
        photoUrl = heygenData.data.photo_url
      } else if (heygenData.data.image_url_list && heygenData.data.image_url_list.length > 0) {
        // Use the first image from the list
        photoUrl = heygenData.data.image_url_list[0]
      }
    }

    console.log(`Extracted status: ${status}, photo URL: ${photoUrl ? "Available" : "Not available"}`)

    // Update status in database
    if ((status === "completed" || status === "success") && photoUrl) {
      console.log("Avatar completed, updating database with photo URL:", photoUrl)
      const { error: updateError } = await supabase
        .from("photo_avatars")
        .update({
          status: "completed",
          image_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", photoAvatarId)

      if (updateError) {
        console.error("Error updating avatar status:", updateError)
        return NextResponse.json({ error: "Failed to update avatar status", details: updateError }, { status: 500 })
      }
      console.log("Database updated successfully")
    } else if (status === "failed") {
      console.log("Avatar generation failed, updating database")
      const { error: updateError } = await supabase
        .from("photo_avatars")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", photoAvatarId)

      if (updateError) {
        console.error("Error updating avatar status:", updateError)
        return NextResponse.json({ error: "Failed to update avatar status", details: updateError }, { status: 500 })
      }
      console.log("Database updated successfully")
    }

    return NextResponse.json({
      success: true,
      status,
      photoUrl,
    })
  } catch (error) {
    console.error("Error checking photo avatar status:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
