"use client"

import { FileText, MoreHorizontal, Pencil, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

export function UploadList() {
  return (
    <div className="space-y-4">
      {uploads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No uploads yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload files to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {uploads.map((file) => (
            <div key={file.id} className="flex items-center gap-4 rounded-lg border p-3">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Rename</span>
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
