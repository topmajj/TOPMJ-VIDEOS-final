"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoTab } from "@/components/tabs/video-tab"
import { T } from "@/components/t"
import { useLanguage } from "@/lib/language-context"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("videos")
  const { t } = useLanguage()

  return (
    <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-1 h-auto">
        <TabsTrigger value="videos">
          <T text="videos.tabs.all" />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="videos" className="space-y-4">
        <VideoTab />
      </TabsContent>
    </Tabs>
  )
}
