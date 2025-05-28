import type React from "react"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Check if user is an admin
  const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (error || !profile || !profile.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <div className="w-full flex-none md:w-64">
        <AdminSidebar />
      </div>
      <div className="flex h-full flex-1 flex-col overflow-auto">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
