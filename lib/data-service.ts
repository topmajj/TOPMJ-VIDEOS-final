import { supabase } from "./supabase"

// Videos
export async function getVideos() {
  const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createVideo(videoData: any) {
  try {
    // Ensure required fields are present
    const requiredFields = ["title", "status"]
    for (const field of requiredFields) {
      if (!videoData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Insert the video
    const { data, error } = await supabase.from("videos").insert([videoData]).select()

    if (error) {
      console.error("Error creating video in Supabase:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in createVideo:", error)
    throw error
  }
}

export async function updateVideoStatus(id: string, status: string, url?: string) {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (url) {
    updates.url = url
  }

  const { data, error } = await supabase.from("videos").update(updates).eq("id", id).select()

  if (error) throw error
  return data[0]
}

// Avatars
export async function getAvatars() {
  const { data, error } = await supabase.from("avatars").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createAvatar(avatarData: any) {
  const { data, error } = await supabase.from("avatars").insert([avatarData]).select()

  if (error) throw error
  return data[0]
}

// Voice Clones
export async function getVoiceClones() {
  const { data, error } = await supabase.from("voice_clones").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createVoiceClone(voiceData: any) {
  const { data, error } = await supabase.from("voice_clones").insert([voiceData]).select()

  if (error) throw error
  return data[0]
}

// Talking Photos
export async function getTalkingPhotos() {
  const { data, error } = await supabase.from("talking_photos").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createTalkingPhoto(photoData: any) {
  const { data, error } = await supabase.from("talking_photos").insert([photoData]).select()

  if (error) throw error
  return data[0]
}

// Uploads
export async function getUploads() {
  const { data, error } = await supabase.from("uploads").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createUpload(uploadData: any) {
  const { data, error } = await supabase.from("uploads").insert([uploadData]).select()

  if (error) throw error
  return data[0]
}

// User Profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function updateUserProfile(userId: string, profileData: any) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert([{ id: userId, ...profileData }])
    .select()

  if (error) throw error
  return data[0]
}

// File Storage
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (error) throw error

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}

// Photo Avatars
export async function getPhotoAvatars() {
  const { data, error } = await supabase.from("photo_avatars").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createPhotoAvatar(avatarData: any) {
  const { data, error } = await supabase.from("photo_avatars").insert([avatarData]).select()

  if (error) throw error
  return data[0]
}

export async function updatePhotoAvatarStatus(id: string, status: string, imageUrl?: string) {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (imageUrl) {
    updates.image_url = imageUrl
  }

  const { data, error } = await supabase.from("photo_avatars").update(updates).eq("id", id).select()

  if (error) throw error
  return data[0]
}

export async function deletePhotoAvatar(id: string) {
  const { error } = await supabase.from("photo_avatars").delete().eq("id", id)

  if (error) throw error
  return true
}
