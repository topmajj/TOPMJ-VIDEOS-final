import { ImageToVideoForm } from "@/components/image-to-video-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function ImageToVideoPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Image to Video</h1>
      <ImageToVideoForm />
    </div>
  )
}
