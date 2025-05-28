import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Missing translation ID" }, { status: 400 })
  }

  try {
    // Get the translation record from the database
    const supabase = createRouteHandlerClient({ cookies })
    const { data: translation, error: dbError } = await supabase
      .from("happyscribe_translations")
      .select("*")
      .eq("id", id)
      .single()

    if (dbError || !translation) {
      console.error("Error fetching translation:", dbError)
      return NextResponse.json({ error: "Translation not found" }, { status: 404 })
    }

    // If we don't have an order ID, we can't check the status
    if (!translation.order_id) {
      return NextResponse.json({
        data: {
          status: translation.status,
          url: translation.download_url,
        },
      })
    }

    console.log(`[happyscribe] /${id} checking order ${translation.order_id}`)

    // Fetch the order details from HappyScribe
    const orderResponse = await fetch(`https://www.happyscribe.com/api/v1/orders/${translation.order_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.HAPPY_SCRIBE_API_KEY}`,
      },
    })

    if (!orderResponse.ok) {
      console.error(`Error fetching order details: ${orderResponse.status} ${orderResponse.statusText}`)
      return NextResponse.json({ error: "Failed to fetch order details" }, { status: orderResponse.status })
    }

    const orderData = await orderResponse.json()
    console.log("Order details:", orderData)

    // Check if the order is fulfilled
    if (orderData.state === "fulfilled") {
      console.log("Order is fulfilled, creating export...")

      // Get the transcription ID from the order outputs
      const transcriptionId = orderData.outputsIds?.[0]

      if (!transcriptionId) {
        console.error("No transcription ID found in order outputs")
        return NextResponse.json({ error: "No transcription ID found" }, { status: 500 })
      }

      // Create an export for the translated transcription
      console.log("Creating export with request:", {
        format: "srt",
        transcription_ids: [transcriptionId],
        show_timestamps: true,
        show_speakers: true,
      })

      const exportRequestBody = {
        export: {
          format: "srt",
          transcription_ids: [transcriptionId],
          show_timestamps: true,
          show_speakers: true,
        },
      }

      console.log("Creating export with request:", JSON.stringify(exportRequestBody, null, 2))

      const exportResponse = await fetch("https://www.happyscribe.com/api/v1/exports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HAPPY_SCRIBE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportRequestBody),
      })

      if (!exportResponse.ok) {
        console.error(`Error creating export: ${exportResponse.status} ${exportResponse.statusText}`)
        return NextResponse.json({ error: "Failed to create export" }, { status: exportResponse.status })
      }

      const exportData = await exportResponse.json()
      console.log("Export created:", exportData)

      // Check the export status
      const exportStatusResponse = await fetch(`https://www.happyscribe.com/api/v1/exports/${exportData.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.HAPPY_SCRIBE_API_KEY}`,
        },
      })

      if (!exportStatusResponse.ok) {
        console.error(`Error checking export status: ${exportStatusResponse.status} ${exportStatusResponse.statusText}`)
        return NextResponse.json({ error: "Failed to check export status" }, { status: exportStatusResponse.status })
      }

      const exportStatusData = await exportStatusResponse.json()
      console.log("Export details:", exportStatusData)

      if (exportStatusData.state === "ready" && exportStatusData.download_link) {
        console.log("Export is ready, download URL:", exportStatusData.download_link)

        // Update the translation record in the database
        const { error: updateError } = await supabase
          .from("happyscribe_translations")
          .update({
            status: "success",
            download_url: exportStatusData.download_link,
            export_id: exportData.id,
          })
          .eq("id", id)

        if (updateError) {
          console.error("Error updating translation:", updateError)
          return NextResponse.json({ error: "Failed to update translation" }, { status: 500 })
        }

        // Fetch the subtitle content and store it locally
        try {
          const subtitleResponse = await fetch(exportStatusData.download_link)
          if (subtitleResponse.ok) {
            const subtitleContent = await subtitleResponse.text()

            // Store the subtitle content in the database
            const { error: storeError } = await supabase.from("subtitle_contents").upsert({
              translation_id: id,
              content: subtitleContent,
              format: "srt",
              language: translation.target_language,
            })

            if (storeError) {
              console.error("Error storing subtitle content:", storeError)
            }
          }
        } catch (error) {
          console.error("Error fetching and storing subtitle content:", error)
        }

        return NextResponse.json({
          data: {
            status: "success",
            url: exportStatusData.download_link,
          },
        })
      } else {
        // Export is not ready yet
        return NextResponse.json({
          data: {
            status: "processing",
            url: null,
          },
        })
      }
    } else if (orderData.state === "failed") {
      // Update the translation record in the database
      const { error: updateError } = await supabase
        .from("happyscribe_translations")
        .update({
          status: "failed",
        })
        .eq("id", id)

      if (updateError) {
        console.error("Error updating translation:", updateError)
        return NextResponse.json({ error: "Failed to update translation" }, { status: 500 })
      }

      return NextResponse.json({
        data: {
          status: "failed",
          url: null,
        },
      })
    } else {
      // Order is still processing
      return NextResponse.json({
        data: {
          status: "processing",
          url: null,
        },
      })
    }
  } catch (error) {
    console.error("Error checking translation status:", error)
    return NextResponse.json({ error: "Failed to check translation status" }, { status: 500 })
  }
}
