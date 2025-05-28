"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { MoreHorizontal, ArrowUpDown, Play, Trash2, Download, Edit, Eye } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface Video {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  duration: number | null
  status: string
  created_at: string
  updated_at: string | null
  avatar_id: string | null
  voice_id: string | null
  script: string | null
  heygen_video_id: string | null
  user_id: string
  user?: User
}

interface AdminVideosTableProps {
  videos: Video[]
  loading?: boolean
  onDelete: (videoId: string) => Promise<void>
}

export default function AdminVideosTable({ videos, loading = false, onDelete }: AdminVideosTableProps) {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null)
  const [videoToView, setVideoToView] = useState<Video | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) => (prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]))
  }

  const toggleSelectAll = () => {
    setSelectedVideos((prev) => (prev.length === videos.length ? [] : videos.map((video) => video.id)))
  }

  const confirmDelete = async () => {
    if (!videoToDelete) return

    setIsDeleting(true)
    try {
      await onDelete(videoToDelete.id)
      setVideoToDelete(null)
    } catch (error) {
      console.error("Error deleting video:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
      case "processing":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Processing</Badge>
      case "failed":
        return <Badge className="bg-red-600 hover:bg-red-700">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUserName = (user?: User) => {
    if (!user) return "Unknown User"

    if (user.first_name) {
      return `${user.first_name} ${user.last_name || ""}`.trim()
    }
    return user.email ? user.email.split("@")[0] : "Unknown User"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (videos.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">No videos found</p>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedVideos.length === videos.length && videos.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all videos"
                />
              </TableHead>
              <TableHead>Video</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Creator</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id} className={selectedVideos.includes(video.id) ? "bg-muted/50" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selectedVideos.includes(video.id)}
                    onCheckedChange={() => toggleVideoSelection(video.id)}
                    aria-label={`Select video ${video.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{video.title || "Untitled video"}</div>
                  {video.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">{video.description}</div>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(video.status)}</TableCell>
                <TableCell>{format(new Date(video.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <div className="text-sm">{getUserName(video.user)}</div>
                  {video.user?.email && <div className="text-xs text-muted-foreground">{video.user.email}</div>}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setVideoToView(video)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      {video.video_url && (
                        <DropdownMenuItem onClick={() => window.open(video.video_url!, "_blank")}>
                          <Play className="mr-2 h-4 w-4" />
                          Play video
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit video
                      </DropdownMenuItem>
                      {video.video_url && (
                        <DropdownMenuItem onClick={() => window.open(video.video_url!, "_blank")}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => setVideoToDelete(video)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete video
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the video "{videoToDelete?.title || "Untitled"}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Video Dialog */}
      <Dialog open={!!videoToView} onOpenChange={(open) => !open && setVideoToView(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{videoToView?.title || "Untitled Video"}</DialogTitle>
            <DialogDescription>Video details and preview</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {videoToView?.video_url && (
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <video
                  src={videoToView.video_url}
                  controls
                  className="h-full w-full"
                  poster={videoToView.thumbnail_url || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p>{getStatusBadge(videoToView?.status || "unknown")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Created</h3>
                <p>{videoToView ? format(new Date(videoToView.created_at), "PPpp") : ""}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Creator</h3>
                <p>{getUserName(videoToView?.user)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Last Updated</h3>
                <p>{videoToView?.updated_at ? format(new Date(videoToView.updated_at), "PPpp") : "Never updated"}</p>
              </div>
              {videoToView?.avatar_id && (
                <div>
                  <h3 className="text-sm font-medium">Avatar</h3>
                  <p>{videoToView.avatar_id}</p>
                </div>
              )}
              {videoToView?.voice_id && (
                <div>
                  <h3 className="text-sm font-medium">Voice</h3>
                  <p>{videoToView.voice_id}</p>
                </div>
              )}
              {videoToView?.heygen_video_id && (
                <div>
                  <h3 className="text-sm font-medium">HeyGen ID</h3>
                  <p>{videoToView.heygen_video_id}</p>
                </div>
              )}
            </div>

            {videoToView?.script && (
              <div>
                <h3 className="text-sm font-medium">Script</h3>
                <div className="mt-1 rounded-md border p-3 text-sm">{videoToView.script}</div>
              </div>
            )}

            {videoToView?.description && (
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p>{videoToView.description}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {videoToView?.video_url && (
              <Button variant="outline" onClick={() => window.open(videoToView.video_url!, "_blank")}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button onClick={() => setVideoToView(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
