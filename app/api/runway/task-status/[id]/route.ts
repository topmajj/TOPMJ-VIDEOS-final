import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import RunwayML from "@runwayml/sdk"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id

    // Check if API key exists
    let apiKey = process.env.RUNWAY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Runway API key is not configured" }, { status: 500 })
    }

    // Make sure the API key starts with 'key_'
    if (!apiKey.startsWith("key_")) {
      apiKey = `key_${apiKey}`
    }

    // Initialize the Runway SDK client
    const client = new RunwayML({ apiKey })

    // Call Runway API to check task status using the SDK
    const taskData = await client.tasks.retrieve(taskId)
    console.log("Task status response:", taskData)

    // If the task is completed, update the database
    if (taskData.status === "SUCCEEDED" && Array.isArray(taskData.output) && taskData.output.length > 0) {
      // Find the generation in the database
      const { data: generation, error: findError } = await supabase
        .from("runway_generations")
        .select("*")
        .eq("runway_task_id", taskId)
        .single()

      if (!findError && generation) {
        // Update the generation with the output URL - use the first URL in the array
        const videoUrl = taskData.output[0]
        const { error: updateError } = await supabase
          .from("runway_generations")
          .update({
            status: "completed",
            output_url: videoUrl,
          })
          .eq("id", generation.id)

        if (updateError) {
          console.error("Error updating generation:", updateError)
        }
      }
    } else if (taskData.status === "FAILED") {
      // Update the generation status to failed
      const { data: generation, error: findError } = await supabase
        .from("runway_generations")
        .select("*")
        .eq("runway_task_id", taskId)
        .single()

      if (!findError && generation) {
        const { error: updateError } = await supabase
          .from("runway_generations")
          .update({
            status: "failed",
          })
          .eq("id", generation.id)

        if (updateError) {
          console.error("Error updating generation:", updateError)
        }
      }
    }

    return NextResponse.json(taskData)
  } catch (error) {
    console.error("Error checking task status:", error)

    let errorMessage = "An unknown error occurred"
    const statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
