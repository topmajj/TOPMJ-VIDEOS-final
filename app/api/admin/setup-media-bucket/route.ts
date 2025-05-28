import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST() {
  try {
    // SQL to create the media bucket and set up policies
    const sql = `
      -- Create the media bucket if it doesn't exist
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('media', 'media', true)
      ON CONFLICT (id) DO NOTHING;

      -- Drop existing policies if they exist to avoid conflicts
      DROP POLICY IF EXISTS "Users can view media files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can upload media files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update their own media files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete their own media files" ON storage.objects;

      -- Create policies for the media bucket
      -- Policy: Allow public access to view media files
      CREATE POLICY "Users can view media files"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'media');

      -- Policy: Allow authenticated users to upload media files
      CREATE POLICY "Users can upload media files"
      ON storage.objects FOR INSERT
      WITH CHECK (
        auth.uid() = owner AND
        bucket_id = 'media'
      );

      -- Policy: Allow authenticated users to update their own media files
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

      -- Policy: Allow authenticated users to delete their own media files
      CREATE POLICY "Users can delete their own media files"
      ON storage.objects FOR DELETE
      USING (
        auth.uid() = owner AND
        bucket_id = 'media'
      );

      -- Make sure RLS is enabled for storage.objects
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    `

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc("stored_procedure", { sql })

    if (error) {
      console.error("Error setting up media bucket:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Media bucket set up successfully" })
  } catch (error: any) {
    console.error("Error in setup-media-bucket route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
