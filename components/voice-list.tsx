"use client"

import { MoreHorizontal, Pencil, Play, Trash2, Mic } from "lucide-react"
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
const voices = [
  {
    id: "1",
    name: "Professional Voice",
    language: "English (US)",
    duration: "30 seconds",
    status: "ready",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Casual Voice",
    language: "English (UK)",
    duration: "45 seconds",
    status: "ready",
    createdAt: "2023-05-10T14:20:00Z",
  },
  {
    id: "3",
    name: "Presentation Voice",
    language: "Spanish",
    duration: "60 seconds",
    status: "processing",
    createdAt: "2023-05-18T09:15:00Z",
  },
]

export function VoiceList() {
  return (
    <div className="space-y-4">
      {voices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Mic className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No voice clones yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your first voice clone to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {voices.map((voice) => (
            <div key={voice.id} className="flex items-center gap-4 rounded-lg border p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mic className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{voice.name}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{voice.language}</span>
                  <span>•</span>
                  <span>{voice.duration}</span>
                  <span>•</span>
                  <span className="capitalize">{voice.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={voice.status === "processing"}>
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Play</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem disabled={voice.status === "processing"}>
                      <Play className="mr-2 h-4 w-4" />
                      <span>Play Sample</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
