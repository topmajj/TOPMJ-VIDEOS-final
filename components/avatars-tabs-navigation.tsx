"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { T } from "@/components/translation"

export function AvatarsTabsNavigation() {
  const pathname = usePathname()

  return (
    <Tabs defaultValue={pathname} className="w-full">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="/dashboard/avatars/photo-avatars" asChild>
          <Link href="/dashboard/avatars/photo-avatars">
            <T text="avatars.tabs.photoAvatars" />
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
