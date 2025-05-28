"use client"
import { useState, useEffect } from "react"
import { MoreHorizontal, Play, Download, Trash2, Loader2, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { T } from "@/components/t"
import { useLanguage } from "@/lib/language-context"

interface Video {
  id: string
  title: string
  status: string
  video_url?: string
  thumbnail_url?: string
  created_at: string
  avatar_id: string
  voice_id: string
  script: string
  heygen_video_id?: string
  duration?: string
  supabase_url?: string
}

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const { t } = useLanguage()

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching videos from Supabase...")

      // Fetch videos from Supabase
      const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Fetched videos:", data)
      setVideos(data || [])

      // Check status of processing videos
      if (data && data.length > 0) {
        const processingVideos = data.filter((v) => v.status === "processing" && v.heygen_video_id)
        if (processingVideos.length > 0) {
          checkVideoStatuses(processingVideos)
        }
      }
    } catch (err: any) {
      console.error("Error fetching videos:", err)
      setError(err.message || t("videos.list.errors.failedToLoad"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()

    // Set up polling for status updates
    const interval = setInterval(() => {
      const processingVideos = videos.filter((v) => v.status === "processing" && v.heygen_video_id)
      if (processingVideos.length > 0) {
        checkVideoStatuses(processingVideos)
      } else {
        clearInterval(interval)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const checkVideoStatuses = async (processingVideos: Video[]) => {
    for (const video of processingVideos) {
      try {
        if (!video.heygen_video_id) continue

        const response = await fetch(`/api/heygen/videos/status?videoId=${video.heygen_video_id}`)
        if (!response.ok) {
          console.error(`Error checking status for video ${video.id}: ${response.statusText}`)
          continue
        }

        const data = await response.json()
        console.log(`Status for video ${video.id}:`, data)

        if (data.status === "completed" && data.video_url) {
          // Save video to Supabase storage
          await saveVideoToSupabase(video.id, data.video_url)

          toast({
            title: t("videos.list.toast.videoReady"),
            description: `${t("videos.list.toast.videoReadyDesc")} "${video.title || t("videos.list.untitled")}"`,
          })
        } else if (data.status === "failed") {
          // Update video in Supabase
          const { error } = await supabase
            .from("videos")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", video.id)

          if (error) {
            console.error(`Error updating video ${video.id} in database:`, error)
            continue
          }

          // Update local state
          setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, status: "failed" } : v)))

          toast({
            title: t("videos.list.toast.videoFailed"),
            description: `${t("videos.list.toast.videoFailedDesc")} "${video.title || t("videos.list.untitled")}"`,
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error(`Error checking status for video ${video.id}:`, err)
      }
    }
  }

  const saveVideoToSupabase = async (videoId: string, heygenUrl: string) => {
    try {
      setSaving((prev) => ({ ...prev, [videoId]: true }))

      // Call the API endpoint to save the video to Supabase
      const response = await fetch("/api/videos/save-to-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          heygenUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t("videos.list.errors.failedToSaveStorage"))
      }

      const data = await response.json()

      // Update local state
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                status: "completed",
                video_url: heygenUrl,
                supabase_url: data.supabaseUrl,
              }
            : v,
        ),
      )

      return data.supabaseUrl
    } catch (err: any) {
      console.error(`Error saving video ${videoId} to Supabase:`, err)
      toast({
        title: t("videos.list.toast.storageError"),
        description: err.message || t("videos.list.errors.failedToSaveStorageDesc"),
        variant: "destructive",
      })

      // Still update the status even if storage fails
      const { error } = await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: heygenUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId)

      if (error) {
        console.error(`Error updating video ${videoId} in database:`, error)
      }

      // Update local state
      setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, status: "completed", video_url: heygenUrl } : v)))

      return null
    } finally {
      setSaving((prev) => ({ ...prev, [videoId]: false }))
    }
  }

  const handlePlayVideo = (video: Video) => {
    if (video.video_url) {
      setPreviewVideo(video)
    } else {
      toast({
        title: t("videos.list.toast.videoNotAvailable"),
        description: t("videos.list.toast.videoNotAvailableDesc"),
        variant: "destructive",
      })
    }
  }

  const handleDownloadVideo = async (video: Video) => {
    if (!video.video_url) {
      toast({
        title: t("videos.list.toast.videoNotAvailable"),
        description: t("videos.list.toast.videoNotAvailableForDownload"),
        variant: "destructive",
      })
      return
    }

    try {
      // Create a temporary anchor element
      const a = document.createElement("a")
      a.href = video.supabase_url || video.video_url
      a.download = `${video.title || "video"}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading video:", err)
      toast({
        title: t("videos.list.toast.downloadFailed"),
        description: t("videos.list.toast.downloadFailedDesc"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteVideo = async (video: Video) => {
    if (!confirm(t("videos.list.confirmDelete"))) return

    try {
      // If there's a Supabase URL, delete from storage first
      if (video.supabase_url) {
        const path = video.supabase_url.split("/").pop()
        if (path) {
          const { error: storageError } = await supabase.storage.from("videos").remove([path])

          if (storageError) {
            console.error("Error deleting video from storage:", storageError)
          }
        }
      }

      // Delete from database
      const { error } = await supabase.from("videos").delete().eq("id", video.id)

      if (error) throw error

      toast({
        title: t("videos.list.toast.videoDeleted"),
        description: t("videos.list.toast.videoDeletedDesc"),
      })

      // Update local state
      setVideos((prev) => prev.filter((v) => v.id !== video.id))
    } catch (err: any) {
      console.error("Error deleting video:", err)
      toast({
        title: t("videos.list.toast.deleteFailed"),
        description: err.message || t("videos.list.toast.deleteFailedDesc"),
        variant: "destructive",
      })
    }
  }

  const handleRefreshStatus = async (video: Video) => {
    if (!video.heygen_video_id) {
      toast({
        title: t("videos.list.toast.cannotRefresh"),
        description: t("videos.list.toast.cannotRefreshDesc"),
        variant: "destructive",
      })
      return
    }

    try {
      setRefreshing((prev) => ({ ...prev, [video.id]: true }))

      const response = await fetch(`/api/heygen/videos/status?videoId=${video.heygen_video_id}`)
      if (!response.ok) {
        throw new Error(`${t("videos.list.errors.failedToFetchStatus")}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Refreshed status for video ${video.id}:`, data)

      if (data.status === "completed" && data.video_url) {
        // Save to Supabase storage
        await saveVideoToSupabase(video.id, data.video_url)

        toast({
          title: t("videos.list.toast.statusUpdated"),
          description: `${t("videos.list.toast.videoStatus")}: ${data.status}`,
        })
      } else {
        // Just update the status
        const { error } = await supabase
          .from("videos")
          .update({
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", video.id)

        if (error) {
          console.error(`Error updating video ${video.id} in database:`, error)
          throw error
        }

        // Update local state
        setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, status: data.status } : v)))

        toast({
          title: t("videos.list.toast.statusUpdated"),
          description: `${t("videos.list.toast.videoStatus")}: ${data.status}`,
        })
      }
    } catch (err: any) {
      console.error("Error refreshing status:", err)
      toast({
        title: t("videos.list.toast.refreshFailed"),
        description: err.message || t("videos.list.toast.refreshFailedDesc"),
        variant: "destructive",
      })
    } finally {
      setRefreshing((prev) => ({ ...prev, [video.id]: false }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <T text="videos.list.status.processing" />
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <T text="videos.list.status.completed" />
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <T text="videos.list.status.failed" />
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">
          <T text="videos.list.loadingVideos" />
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>
          <T text="videos.list.errorLoadingVideos" />
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="w-fit" onClick={fetchVideos}>
            <RefreshCw className="h-4 w-4 mr-2" />
            <T text="videos.list.tryAgain" />
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-3">
          <Play className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">
          <T text="videos.list.noVideosYet" />
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          <T text="videos.list.createFirstVideo" />
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center gap-4 rounded-lg border p-3">
            <div className="relative flex-shrink-0">
              <img
                src={video.thumbnail_url || "/placeholder.svg?height=120&width=200"}
                alt={video.title || t("videos.list.videoThumbnail")}
                className="h-20 w-32 rounded-md object-cover"
              />
              {video.status === "processing" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                  <div className="text-xs font-medium text-white flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    <T text="videos.list.processing" />
                  </div>
                </div>
              ) : saving[video.id] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                  <div className="text-xs font-medium text-white flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    <T text="videos.list.saving" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => handlePlayVideo(video)}
                    disabled={video.status !== "completed"}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{video.title || <T text="videos.list.untitledVideo" />}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
                <span>•</span>
                {getStatusBadge(video.status)}
                {video.supabase_url && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      <T text="videos.list.status.stored" />
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{video.script}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">
                    <T text="videos.list.openMenu" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <T text="videos.list.actions" />
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handlePlayVideo(video)} disabled={video.status !== "completed"}>
                  <Play className="mr-2 h-4 w-4" />
                  <span>
                    <T text="videos.list.preview" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadVideo(video)} disabled={video.status !== "completed"}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>
                    <T text="videos.list.download" />
                  </span>
                </DropdownMenuItem>
                {video.video_url && (
                  <DropdownMenuItem onClick={() => window.open(video.video_url, "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>
                      <T text="videos.list.openInNewTab" />
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRefreshStatus(video)}
                  disabled={!video.heygen_video_id || refreshing[video.id] || saving[video.id]}
                >
                  {refreshing[video.id] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  <span>
                    <T text="videos.list.refreshStatus" />
                  </span>
                </DropdownMenuItem>
                {video.status === "completed" && !video.supabase_url && (
                  <DropdownMenuItem
                    onClick={() => saveVideoToSupabase(video.id, video.video_url!)}
                    disabled={saving[video.id]}
                  >
                    {saving[video.id] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    <span>
                      <T text="videos.list.saveToStorage" />
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteVideo(video)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>
                    <T text="videos.list.delete" />
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewVideo?.title || <T text="videos.list.videoPreview" />}</DialogTitle>
            <DialogDescription>{previewVideo?.script}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden relative min-h-[400px]">
            {previewVideo && (
              <video
                src={previewVideo.supabase_url || previewVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                <T text="videos.list.browserNotSupported" />
              </video>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {previewVideo && (
              <Button onClick={() => handleDownloadVideo(previewVideo)}>
                <Download className="mr-2 h-4 w-4" />
                <T text="videos.list.download" />
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewVideo(null)}>
              <T text="videos.list.close" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
