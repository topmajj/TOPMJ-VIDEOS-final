import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { RunwayGenerationsList } from "@/components/runway-generations-list"
import { MediaGenerationTabsNavigation } from "@/components/media-generation-tabs-navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { T } from "@/components/translation"

export default async function MediaGenerationPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            <T text="mediaGeneration.title" />
          </h1>
          <p className="text-muted-foreground">
            <T text="mediaGeneration.description" />
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/media-generation/image-to-video">
            <T text="mediaGeneration.createNew" />
          </Link>
        </Button>
      </div>

      <MediaGenerationTabsNavigation />

      <div className="mt-6">
        <RunwayGenerationsList />
      </div>
    </div>
  )
}
