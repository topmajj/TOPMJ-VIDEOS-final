import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { T } from "@/components/translation" // Import the translation component

export default async function CreditsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <T text="credits.title" />
          </h1>
          <p className="text-muted-foreground">
            <T text="credits.description" />
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}
