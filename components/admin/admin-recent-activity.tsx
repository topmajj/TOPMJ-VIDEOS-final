"use client"

import { formatDistanceToNow } from "date-fns"
import { Video, User, Clock } from "lucide-react"

interface Activity {
  id: string
  type: "user" | "video"
  title: string
  timestamp: string
  user: string
  status?: string
}

interface RecentUser {
  id: string
  first_name: string | null
  last_name: string | null
  created_at: string
  email: { email: string } | null
}

interface RecentVideo {
  id: string
  title: string
  status: string
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: { email: string } | null
  }
}

export default function AdminRecentActivity({
  recentUsers,
  recentVideos,
}: {
  recentUsers: RecentUser[] | null
  recentVideos: RecentVideo[] | null
}) {
  // Combine and format the activity data
  const activities: Activity[] = []

  if (recentUsers) {
    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: "user",
        title: "New user registered",
        timestamp: user.created_at,
        user: user.first_name
          ? `${user.first_name} ${user.last_name || ""}`
          : user.email?.email?.split("@")[0] || "Anonymous User",
      })
    })
  }

  if (recentVideos) {
    recentVideos.forEach((video) => {
      activities.push({
        id: `video-${video.id}`,
        type: "video",
        title: video.title || "Untitled video",
        timestamp: video.created_at,
        user: video.profiles.first_name
          ? `${video.profiles.first_name} ${video.profiles.last_name || ""}`
          : video.profiles.email?.email?.split("@")[0] || "Anonymous User",
        status: video.status,
      })
    })
  }

  // Sort by timestamp, newest first
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (activities.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">No recent activity</p>
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, 10).map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div
            className={`mt-0.5 rounded-full p-2 ${
              activity.type === "user"
                ? "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
            }`}
          >
            {activity.type === "user" ? <User className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </div>
          <div className="flex flex-col">
            <p className="font-medium">{activity.title}</p>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span>By {activity.user}</span>
              {activity.status && (
                <>
                  <span>•</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activity.status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : activity.status === "processing"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
