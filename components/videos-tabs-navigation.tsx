"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { T } from "@/components/translation"

export function VideosTabsNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mb-8">
      <Link
        href="/dashboard/videos"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/videos" ? "text-primary border-b-2 border-primary" : "text-muted-foreground",
        )}
      >
        <T text="videos.tabs.all" />
      </Link>
      <Link
        href="/dashboard/videos/create"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/videos/create" ? "text-primary border-b-2 border-primary" : "text-muted-foreground",
        )}
      >
        <T text="videos.create.title" />
      </Link>
    </nav>
  )
}
