"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  email: { email: string } | null
}

interface Video {
  id: string
  title: string
  status: string
  created_at: string
  user_id: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: { email: string } | null
  }
}

interface Generation {
  id: string
  prompt: string
  type: string
  status: string
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: { email: string } | null
  }
}

interface RecentActivityData {
  users: User[]
  videos: Video[]
  generations: Generation[]
}

export default function RecentActivityClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activityData, setActivityData] = useState<RecentActivityData | null>(null)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/metrics/dashboard")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setActivityData(result.data.recent)
        } else {
          throw new Error(result.error || "Failed to fetch activity data")
        }
      } catch (err) {
        console.error("Failed to fetch activity data:", err)
        setError("Failed to load recent activity")
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (error) {
    return <div className="text-center text-sm text-red-500 py-10">{error}</div>
  }

  if (!activityData) {
    return <div className="text-center text-sm text-muted-foreground py-10">No recent activity available</div>
  }

  // Combine and sort all activities by date
  const allActivities = [
    ...activityData.users.map((user) => ({
      id: user.id,
      type: "user_registered",
      date: new Date(user.created_at),
      user: {
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Anonymous",
        email: user.email?.email || "unknown@example.com",
        avatar: user.avatar_url,
      },
      details: "Registered an account",
    })),
    ...activityData.videos.map((video) => ({
      id: video.id,
      type: "video_created",
      date: new Date(video.created_at),
      user: {
        name: `${video.profiles.first_name || ""} ${video.profiles.last_name || ""}`.trim() || "Anonymous",
        email: video.profiles.email?.email || "unknown@example.com",
      },
      details: `Created video: ${video.title || "Untitled"} (${video.status})`,
    })),
    ...activityData.generations.map((gen) => ({
      id: gen.id,
      type: "generation_created",
      date: new Date(gen.created_at),
      user: {
        name: `${gen.profiles.first_name || ""} ${gen.profiles.last_name || ""}`.trim() || "Anonymous",
        email: gen.profiles.email?.email || "unknown@example.com",
      },
      details: `Created ${gen.type} generation: ${gen.prompt?.substring(0, 30)}${gen.prompt?.length > 30 ? "..." : ""} (${gen.status})`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)

  return (
    <div className="space-y-8">
      {allActivities.map((activity) => (
        <div key={`${activity.type}-${activity.id}`} className="flex items-start">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar || undefined} alt={activity.user.name} />
            <AvatarFallback>
              {activity.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium">{activity.user.name}</p>
            <p className="text-sm text-muted-foreground">{activity.details}</p>
            <p className="text-xs text-muted-foreground">
              {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
