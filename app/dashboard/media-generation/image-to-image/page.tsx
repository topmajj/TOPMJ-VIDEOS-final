import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ImageToImageForm } from "@/components/image-to-image-form"
import { T } from "@/components/translation"

export default async function ImageToImagePage() {
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
        <T text="mediaGeneration.imageToImage.title" />
      </h1>
      <ImageToImageForm userId={user.id} />
    </div>
  )
}
