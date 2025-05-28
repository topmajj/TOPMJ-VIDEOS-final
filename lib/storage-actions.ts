"use server"

import { supabaseAdmin } from "./supabase-server"

export async function setupVideoBucketPolicies() {
  try {
    // Create the videos bucket if it doesn't exist
    const { error: bucketError } = await supabaseAdmin.storage.createBucket("videos", {
      public: false,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB limit
    })

    if (bucketError && !bucketError.message.includes("already exists")) {
      throw bucketError
    }

    // Apply policies using raw SQL
    // Note: This is a simplified approach. In production, you might want to check if policies exist first.
    const policies = [
      `
      CREATE POLICY "Users can view their own videos"
      ON storage.objects FOR SELECT
      USING (
        auth.uid() = owner AND
        bucket_id = 'videos'
      );
      `,
      `
      CREATE POLICY "Users can upload videos"
      ON storage.objects FOR INSERT
      WITH CHECK (
        auth.uid() = owner AND
        bucket_id = 'videos'
      );
      `,
      `
      CREATE POLICY "Users can update their own videos"
      ON storage.objects FOR UPDATE
      USING (
        auth.uid() = owner AND
        bucket_id = 'videos'
      )
      WITH CHECK (
        auth.uid() = owner AND
        bucket_id = 'videos'
      );
      `,
      `
      CREATE POLICY "Users can delete their own videos"
      ON storage.objects FOR DELETE
      USING (
        auth.uid() = owner AND
        bucket_id = 'videos'
      );
      `,
    ]

    // Apply each policy, ignoring errors if policy already exists
    for (const policy of policies) {
      const { error } = await supabaseAdmin.rpc("stored_procedure", { sql: policy })
      if (error && !error.message.includes("already exists")) {
        console.error("Error applying policy:", error)
      }
    }

    return { success: true, message: "Video bucket policies applied successfully" }
  } catch (error: any) {
    console.error("Error setting up video bucket policies:", error)
    return { success: false, message: error.message || "Failed to apply video bucket policies" }
  }
}

// Add this new function to set up media bucket policies

export async function setupMediaBucketPolicies() {
  try {
    // Create the media bucket if it doesn't exist
    const { error: bucketError } = await supabaseAdmin.storage.createBucket("media", {
      public: true, // Make it public so we can access the files without authentication
      fileSizeLimit: 100 * 1024 * 1024, // 100MB limit
    })

    if (bucketError && !bucketError.message.includes("already exists")) {
      throw bucketError
    }

    // Apply policies using raw SQL
    const policies = [
      `
    CREATE POLICY "Users can view media files"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'media'
    );
    `,
      `
    CREATE POLICY "Users can upload media files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      auth.uid() = owner AND
      bucket_id = 'media'
    );
    `,
      `
    CREATE POLICY "Users can update their own media files"
    ON storage.objects FOR UPDATE
    USING (
      auth.uid() = owner AND
      bucket_id = 'media'
    )
    WITH CHECK (
      auth.uid() = owner AND
      bucket_id = 'media'
    );
    `,
      `
    CREATE POLICY "Users can delete their own media files"
    ON storage.objects FOR DELETE
    USING (
      auth.uid() = owner AND
      bucket_id = 'media'
    );
    `,
    ]

    // Apply each policy, ignoring errors if policy already exists
    for (const policy of policies) {
      const { error } = await supabaseAdmin.rpc("stored_procedure", { sql: policy })
      if (error && !error.message.includes("already exists")) {
        console.error("Error applying policy:", error)
      }
    }

    return { success: true, message: "Media bucket policies applied successfully" }
  } catch (error: any) {
    console.error("Error setting up media bucket policies:", error)
    return { success: false, message: error.message || "Failed to apply media bucket policies" }
  }
}
