"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useLanguage } from "@/lib/language-context"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { language } = useLanguage()

  // Update the html dir attribute when language changes
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  return (
    <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen w-full dashboard-container">
        <div className="dashboard-sidebar">
          <DashboardSidebar />
        </div>
        <div className="flex flex-col flex-1 w-full dashboard-main">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
