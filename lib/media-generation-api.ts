import { supabase } from "./supabase"
import { supabaseAdmin } from "./supabase-server"

export type GenerationType = "image" | "video" | "image-to-image"

export interface GenerationResult {
  id: string
  url: string
  prompt: string
  type: GenerationType
  status: "processing" | "completed" | "failed"
  createdAt: string
}

// Function to save generation to Supabase
export async function saveGeneration(
  userId: string,
  prompt: string,
  type: GenerationType,
  outputUrl: string,
  inputImageUrl?: string,
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("runway_generations")
    .insert({
      user_id: userId,
      prompt,
      type,
      output_url: outputUrl,
      input_image_url: inputImageUrl,
      status: "completed",
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error saving generation:", error)
    throw new Error(`Failed to save generation: ${error.message}`)
  }

  return data.id
}

// Function to get user's generations
export async function getUserGenerations(userId: string): Promise<GenerationResult[]> {
  const { data, error } = await supabase
    .from("runway_generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching generations:", error)
    throw new Error(`Failed to fetch generations: ${error.message}`)
  }

  return data.map((item) => ({
    id: item.id,
    url: item.output_url,
    prompt: item.prompt,
    type: item.type,
    status: item.status,
    createdAt: item.created_at,
  }))
}

// Function to upload image to Supabase storage
export async function uploadImageToStorage(userId: string, file: File): Promise<string> {
  try {
    // Use a more unique filename to avoid collisions
    const fileExt = file.name.split(".").pop()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileName = `${userId}/${timestamp}_${randomString}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Use supabaseAdmin to upload the file
    const { data, error } = await supabaseAdmin.storage.from("media").upload(fileName, arrayBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage.from("media").getPublicUrl(fileName)
    return urlData.publicUrl
  } catch (error) {
    console.error("Error in uploadImageToStorage:", error)
    throw error
  }
}
