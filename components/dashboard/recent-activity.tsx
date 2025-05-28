"use client"

import { Image, Mic, Upload, Users, Video } from "lucide-react"

type ActivityItem = {
  id: string | number
  action: string
  time: string
  icon: "Video" | "Users" | "Mic" | "Image" | "Upload"
}

const iconMap = {
  Video: Video,
  Users: Users,
  Mic: Mic,
  Image: Image,
  Upload: Upload,
}

interface RecentActivityProps {
  activities?: ActivityItem[]
}

const defaultActivities = [
  {
    id: 1,
    action: "Created a new video",
    time: "2 hours ago",
    icon: "Video" as const,
  },
  {
    id: 2,
    action: "Added a new avatar",
    time: "Yesterday",
    icon: "Users" as const,
  },
  {
    id: 3,
    action: "Cloned a new voice",
    time: "2 days ago",
    icon: "Mic" as const,
  },
  {
    id: 4,
    action: "Created a talking photo",
    time: "3 days ago",
    icon: "Image" as const,
  },
  {
    id: 5,
    action: "Uploaded new files",
    time: "4 days ago",
    icon: "Upload" as const,
  },
]

export function RecentActivity({ activities = defaultActivities }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No recent activity found</p>
      ) : (
        activities.map((activity) => {
          const IconComponent = iconMap[activity.icon]

          return (
            <div key={activity.id} className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
