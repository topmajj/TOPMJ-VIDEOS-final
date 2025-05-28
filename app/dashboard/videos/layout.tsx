import type React from "react"
import { VideosTabsNavigation } from "@/components/videos-tabs-navigation"
import { T } from "@/components/translation"

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          <T text="videos.title" />
        </h2>
      </div>
      <VideosTabsNavigation />
      {children}
    </div>
  )
}
