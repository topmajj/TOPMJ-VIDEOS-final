"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Eye, Loader2, MoreHorizontal, RefreshCw, Trash2, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface PhotoAvatar {
  id: string
  name: string
  age: string
  gender: string
  ethnicity: string
  orientation: string
  pose: string
  style: string
  appearance: string
  generation_id: string
  status: string
  image_url: string | null
  created_at: string
}

export function PhotoAvatarsList() {
  const { toast } = useToast()
  const router = useRouter()
  const [photoAvatars, setPhotoAvatars] = useState<PhotoAvatar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set())
  const [selectedAvatar, setSelectedAvatar] = useState<PhotoAvatar | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [avatarIdForVideo, setAvatarIdForVideo] = useState<string | null>(null)

  const fetchPhotoAvatars = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/heygen/photo-avatars")

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch photo avatars")
      }

      const data = await response.json()
      setPhotoAvatars(data.photoAvatars || [])
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching photo avatars")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotoAvatars()
  }, [])

  // Update the checkStatus function to handle the response better and add a manual refresh button

  // In the checkStatus function, update the error handling and add more logging
  const checkStatus = async (photoAvatar: PhotoAvatar) => {
    if (photoAvatar.status === "completed" || !photoAvatar.generation_id) {
      return
    }

    try {
      setRefreshingIds((prev) => new Set(prev).add(photoAvatar.id))

      const response = await fetch(
        `/api/heygen/photo-avatars/status?generationId=${photoAvatar.generation_id}&photoAvatarId=${photoAvatar.id}`,
      )

      if (!response.ok) {
        let errorMessage = "Failed to check status"
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          console.error("Status check error:", data)
        } catch (e) {
          console.error("Error parsing error response:", e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Status check response:", data)

      if (data.status === "completed") {
        // Refresh the list to get the updated avatar
        await fetchPhotoAvatars()
        toast({
          title: "Avatar completed",
          description: "Your avatar has been successfully generated.",
        })
      } else if (data.status === "failed") {
        toast({
          title: "Avatar generation failed",
          description: "There was an error generating your avatar. Please try again.",
          variant: "destructive",
        })
        await fetchPhotoAvatars()
      } else {
        // Still processing
        toast({
          title: "Still processing",
          description: "Your avatar is still being generated. Please check back later.",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to check avatar status",
        variant: "destructive",
      })
    } finally {
      setRefreshingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(photoAvatar.id)
        return newSet
      })
    }
  }

  // Add a manual refresh function to the component
  const refreshList = async () => {
    await fetchPhotoAvatars()
    toast({
      title: "List refreshed",
      description: "The avatar list has been refreshed.",
    })
  }

  const deletePhotoAvatar = async (id: string) => {
    try {
      const response = await fetch(`/api/heygen/photo-avatars/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete photo avatar")
      }

      // Remove the deleted avatar from the list
      setPhotoAvatars((prev) => prev.filter((avatar) => avatar.id !== id))

      toast({
        title: "Avatar deleted",
        description: "Your avatar has been successfully deleted.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete avatar",
        variant: "destructive",
      })
    }
  }

  const viewAvatar = (avatar: PhotoAvatar) => {
    setSelectedAvatar(avatar)
    setIsDialogOpen(true)
  }

  const useAvatar = useCallback(() => {
    if (avatarIdForVideo) {
      router.push(`/dashboard/videos/create?avatarId=${avatarIdForVideo}`)
    }
  }, [router, avatarIdForVideo])

  useEffect(() => {
    if (selectedAvatar) {
      setAvatarIdForVideo(selectedAvatar.id)
    }
  }, [selectedAvatar])

  if (loading && photoAvatars.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (photoAvatars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-3">
          <User className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No photo avatars yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Create your first AI photo avatar to get started</p>
      </div>
    )
  }

  // Add a refresh button at the top of the component's return statement
  // Add this right after the opening <div> in the return statement
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={refreshList} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh List
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photoAvatars.map((avatar) => (
          <Card key={avatar.id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {avatar.image_url ? (
                <img
                  src={avatar.image_url || "/placeholder.svg"}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {avatar.status === "pending" || avatar.status === "processing" ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {avatar.status === "pending" ? "Pending" : "Processing"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                      <p className="text-sm text-muted-foreground">{avatar.status === "failed" ? "Failed" : "Error"}</p>
                    </div>
                  )}
                </div>
              )}
              {avatar.status === "pending" || avatar.status === "processing" ? (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => checkStatus(avatar)}
                  disabled={refreshingIds.has(avatar.id)}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshingIds.has(avatar.id) ? "animate-spin" : ""}`} />
                </Button>
              ) : null}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{avatar.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {avatar.style} • {avatar.pose.replace("_", " ")}
                  </p>
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
                    {avatar.image_url && (
                      <DropdownMenuItem onClick={() => viewAvatar(avatar)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                    )}
                    {(avatar.status === "pending" || avatar.status === "processing") && (
                      <DropdownMenuItem onClick={() => checkStatus(avatar)} disabled={refreshingIds.has(avatar.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Check Status</span>
                      </DropdownMenuItem>
                    )}
                    {avatar.image_url && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAvatar(avatar)
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Use in Video</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deletePhotoAvatar(avatar.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
            {avatar.image_url && (
              <CardFooter className="p-4 pt-0">
                <Button variant="secondary" size="sm" className="w-full" onClick={() => viewAvatar(avatar)}>
                  View Avatar
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAvatar?.name}</DialogTitle>
            <DialogDescription>
              {selectedAvatar?.style} • {selectedAvatar?.pose.replace("_", " ")}
            </DialogDescription>
          </DialogHeader>
          {selectedAvatar?.image_url && (
            <div className="overflow-hidden rounded-md">
              <img
                src={selectedAvatar.image_url || "/placeholder.svg"}
                alt={selectedAvatar.name}
                className="w-full object-contain"
              />
            </div>
          )}
          <div className="text-sm">
            <p>
              <strong>Description:</strong> {selectedAvatar?.appearance}
            </p>
            <p className="mt-2">
              <strong>Details:</strong> {selectedAvatar?.gender}, {selectedAvatar?.age}, {selectedAvatar?.ethnicity}
            </p>
          </div>
          {selectedAvatar?.image_url && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  useAvatar()
                  setIsDialogOpen(false)
                }}
              >
                Use in Video
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
