import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { TextToVideoForm } from "@/components/text-to-video-form"
import { T } from "@/components/translation"

export default async function TextToVideoPage() {
  const supabase = createServerComponentClient({ cookies })

  // Use getUser instead of getSession for better security
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">
        <T text="mediaGeneration.textToVideo.title" />
      </h1>
      <TextToVideoForm userId={user.id} />
    </div>
  )
}
