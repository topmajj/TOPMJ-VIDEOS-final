"use client"

import { MoreHorizontal, Pencil, Play, Share, Trash2, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample data
const talkingPhotos = [
  {
    id: "1",
    title: "Product Spokesperson",
    thumbnail: "/placeholder.svg?height=120&width=200",
    duration: "0:45",
    status: "completed",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    title: "CEO Announcement",
    thumbnail: "/placeholder.svg?height=120&width=200",
    duration: "1:30",
    status: "processing",
    createdAt: "2023-05-18T09:15:00Z",
  },
]

export function TalkingPhotoList() {
  return (
    <div className="space-y-4">
      {talkingPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Image className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No talking photos yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your first talking photo to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {talkingPhotos.map((photo) => (
            <div key={photo.id} className="flex items-center gap-4 rounded-lg border p-3">
              <div className="relative flex-shrink-0">
                <img
                  src={photo.thumbnail || "/placeholder.svg"}
                  alt={photo.title}
                  className="h-20 w-32 rounded-md object-cover"
                />
                {photo.status === "processing" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <div className="text-xs font-medium text-white">Processing...</div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{photo.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{photo.duration}</span>
                  <span>•</span>
                  <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem disabled={photo.status === "processing"}>
                    <Play className="mr-2 h-4 w-4" />
                    <span>Play</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={photo.status === "processing"}>
                    <Share className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
