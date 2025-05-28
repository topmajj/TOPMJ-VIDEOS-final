"use client"

import { MoreHorizontal, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data
const talkingPhotos = [
  {
    id: "1",
    title: "Product Spokesperson",
    thumbnail: "/placeholder.svg?height=120&width=200",
    duration: "0:45",
    status: "Ready",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    title: "CEO Announcement",
    thumbnail: "/placeholder.svg?height=120&width=200",
    duration: "1:30",
    status: "Processing",
    createdAt: "2023-05-18T09:15:00Z",
  },
]

export default function TalkingPhotosPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Talking Photos</h1>
        <p className="text-muted-foreground">Create and manage your talking photos</p>
      </div>

      <Tabs defaultValue="my-photos" className="w-full">
        <TabsList>
          <TabsTrigger value="my-photos">My Photos</TabsTrigger>
          <TabsTrigger value="create-photo">Create Photo</TabsTrigger>
        </TabsList>

        <TabsContent value="my-photos" className="w-full space-y-4 mt-4">
          {talkingPhotos.map((photo) => (
            <div key={photo.id} className="flex items-center gap-4 rounded-lg border p-4">
              <div className="relative flex-shrink-0">
                <img
                  src={photo.thumbnail || "/placeholder.svg"}
                  alt={photo.title}
                  className="h-20 w-32 rounded-md object-cover"
                />
                {photo.status === "Processing" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <div className="text-xs font-medium text-white">Processing...</div>
                  </div>
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{photo.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{photo.duration}</span>
                  <span>•</span>
                  <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="capitalize">{photo.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={photo.status === "Processing"}>
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Play</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="create-photo" className="w-full">
          {/* Create photo content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
