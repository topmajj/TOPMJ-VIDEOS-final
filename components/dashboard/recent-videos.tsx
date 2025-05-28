"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface VideoItem {
  id: string
  title: string
  thumbnail_url?: string
  view_count?: number
  created_at: string
}

interface RecentVideosProps {
  videos?: VideoItem[]
}

const defaultVideos = [
  {
    id: "1",
    title: "Product Demo",
    thumbnail_url: "/placeholder.svg?height=60&width=100",
    view_count: 1200,
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Company Introduction",
    thumbnail_url: "/placeholder.svg?height=60&width=100",
    view_count: 845,
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "3",
    title: "Feature Walkthrough",
    thumbnail_url: "/placeholder.svg?height=60&width=100",
    view_count: 632,
    created_at: "2023-01-01T00:00:00Z",
  },
]

export function RecentVideos({ videos = defaultVideos }: RecentVideosProps) {
  // Format date to "X days/weeks ago"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
    } else {
      const months = Math.floor(diffDays / 30)
      return `${months} ${months === 1 ? "month" : "months"} ago`
    }
  }

  // Format view count to "1.2K" format
  const formatViewCount = (count?: number) => {
    if (!count) return "0"

    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }

    return count.toString()
  }

  return (
    <div className="space-y-4">
      {videos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No videos found</p>
      ) : (
        videos.map((video) => (
          <div key={video.id} className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={video.thumbnail_url || "/placeholder.svg?height=60&width=100"}
                alt={video.title}
                className="h-14 w-24 rounded-md object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="h-7 w-7">
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{video.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatViewCount(video.view_count)} views</span>
                <span>•</span>
                <span>{formatDate(video.created_at)}</span>
              </div>
            </div>
          </div>
        ))
      )}

      <div className="pt-2">
        <Link href="/dashboard/videos">
          <Button variant="ghost" size="sm" className="w-full">
            View all videos
          </Button>
        </Link>
      </div>
    </div>
  )
}
