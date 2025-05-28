import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function VoiceLayout({
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
    const returnUrl = "/dashboard/voice-cloning"
    redirect(`/login?from=${encodeURIComponent(returnUrl)}`)
  }

  return children
}
