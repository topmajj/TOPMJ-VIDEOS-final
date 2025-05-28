"use client"

import { MoreHorizontal, Pencil, Play, Trash2, User } from "lucide-react"
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
const avatars = [
  {
    id: "1",
    name: "Business Avatar",
    image: "/placeholder.svg?height=100&width=100",
    type: "digital-human",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Casual Presenter",
    image: "/placeholder.svg?height=100&width=100",
    type: "talking-photo",
    createdAt: "2023-05-10T14:20:00Z",
  },
]

export function AvatarList() {
  return (
    <div className="space-y-4">
      {avatars.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <User className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No avatars yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your first avatar to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {avatars.map((avatar) => (
            <div key={avatar.id} className="flex flex-col rounded-lg border overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <img
                  src={avatar.image || "/placeholder.svg"}
                  alt={avatar.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                  <Button size="icon" variant="secondary" className="h-10 w-10">
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{avatar.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{avatar.type.replace("-", " ")}</p>
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
                        <Play className="mr-2 h-4 w-4" />
                        <span>Preview</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
