"use server"

import { supabaseAdmin } from "./supabase-server"

// Example: Get all users (admin only operation)
export async function getAllUsers() {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

// Example: Update user status (admin only operation)
export async function updateUserStatus(userId: string, status: string) {
  const { data, error } = await supabaseAdmin.from("profiles").update({ status }).eq("id", userId).select()

  if (error) throw error
  return data[0]
}

// Example: Delete user data (admin only operation)
export async function deleteUserData(userId: string) {
  // This bypasses RLS and can delete any user's data
  const { error: videosError } = await supabaseAdmin.from("videos").delete().eq("user_id", userId)

  if (videosError) throw videosError

  const { error: avatarsError } = await supabaseAdmin.from("avatars").delete().eq("user_id", userId)

  if (avatarsError) throw avatarsError

  // Continue with other tables...

  return { success: true }
}

// Example: Get system-wide statistics (admin only operation)
export async function getSystemStats() {
  // Get total users count
  const { count: usersCount, error: usersError } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })

  if (usersError) throw usersError

  // Get total videos count
  const { count: videosCount, error: videosError } = await supabaseAdmin
    .from("videos")
    .select("*", { count: "exact", head: true })

  if (videosError) throw videosError

  // Get total storage used
  // This would require a more complex query or additional tracking

  return {
    usersCount,
    videosCount,
    // Add more stats as needed
  }
}

// Example: Create a webhook handler
export async function handleWebhook(payload: any) {
  // Process webhook payload and update database
  // This often needs to bypass RLS to update various records

  // Example: Update video status when processing is complete
  if (payload.type === "video.processed") {
    const { data, error } = await supabaseAdmin
      .from("videos")
      .update({
        status: "completed",
        video_url: payload.video_url,
        duration: payload.duration,
      })
      .eq("id", payload.video_id)
      .select()

    if (error) throw error
    return data[0]
  }

  return { success: true }
}
