import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { AvatarsTabsNavigation } from "@/components/avatars-tabs-navigation"
import { T } from "@/components/translation"

export default async function AvatarsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login with the intended path
  if (!session) {
    const returnUrl = "/dashboard/avatars"
    redirect(`/login?from=${encodeURIComponent(returnUrl)}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <T text="avatars.title" />
        </h1>
        <p className="text-muted-foreground">
          <T text="avatars.subtitle" />
        </p>
      </div>

      <AvatarsTabsNavigation />

      {children}
    </div>
  )
}
