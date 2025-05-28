"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { T } from "@/components/translation"

export function MediaGenerationTabsNavigation() {
  const pathname = usePathname()

  const tabs = [
    {
      name: <T text="mediaGeneration.tabs.allGenerations" />,
      href: "/dashboard/media-generation",
      active: pathname === "/dashboard/media-generation",
    },
    {
      name: <T text="mediaGeneration.tabs.imageToVideo" />,
      href: "/dashboard/media-generation/image-to-video",
      active: pathname === "/dashboard/media-generation/image-to-video",
    },
  ]

  return (
    <div className="border-b">
      <nav className="flex space-x-4">
        {tabs.map((tab) => (
          <Link
            key={typeof tab.name === "string" ? tab.name : tab.href}
            href={tab.href}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
              tab.active ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
            )}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
