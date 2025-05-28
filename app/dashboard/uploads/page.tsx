"use client"

import { FileText, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data
const uploads = [
  {
    id: "1",
    name: "background.jpg",
    type: "image/jpeg",
    size: "2.4 MB",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    name: "voice-sample.mp3",
    type: "audio/mpeg",
    size: "1.8 MB",
    createdAt: "2023-05-10T14:20:00Z",
  },
  {
    id: "3",
    name: "product-demo.mp4",
    type: "video/mp4",
    size: "15.6 MB",
    createdAt: "2023-05-18T09:15:00Z",
  },
]

export default function UploadsPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
        <p className="text-muted-foreground">Manage your uploaded files</p>
      </div>

      <Tabs defaultValue="all-files" className="w-full">
        <TabsList>
          <TabsTrigger value="all-files">All Files</TabsTrigger>
          <TabsTrigger value="upload-new">Upload New</TabsTrigger>
        </TabsList>

        <TabsContent value="all-files" className="w-full mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              Delete Selected
            </Button>
          </div>

          <div className="space-y-4">
            {uploads.map((file) => (
              <div key={file.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{file.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{file.type.split("/")[0]}</span>
                    <span>•</span>
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload-new" className="w-full">
          {/* Upload new content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
