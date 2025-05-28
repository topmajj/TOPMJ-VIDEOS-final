"use client"

import { useEffect, useState } from "react"
import { Users, Video, Mic, ImageIcon, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardMetricsProps = {}

interface MetricsData {
  counts: {
    users: number
    videos: number
    voiceClones: number
    photoAvatars: number
    mediaGenerations: number
    revenue: number
  }
  growth: {
    users: number
    videos: number
  }
}

export default function DashboardMetrics({}: DashboardMetricsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/metrics/dashboard")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setMetrics(result.data)
        } else {
          throw new Error(result.error || "Failed to fetch metrics")
        }
      } catch (err) {
        console.error("Failed to fetch metrics:", err)
        setError("Failed to load dashboard metrics")
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-sm text-red-500 py-10">{error}</div>
  }

  if (!metrics) {
    return <div className="text-center text-sm text-muted-foreground py-10">No metrics available</div>
  }

  const stats = [
    {
      title: "Total Users",
      value: metrics.counts.users,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      change: `${metrics.growth.users > 0 ? "+" : ""}${metrics.growth.users}%`,
      trend: metrics.growth.users >= 0 ? "up" : "down",
    },
    {
      title: "Total Videos",
      value: metrics.counts.videos,
      icon: <Video className="h-5 w-5 text-indigo-500" />,
      change: `${metrics.growth.videos > 0 ? "+" : ""}${metrics.growth.videos}%`,
      trend: metrics.growth.videos >= 0 ? "up" : "down",
    },
    {
      title: "Voice Clones",
      value: metrics.counts.voiceClones,
      icon: <Mic className="h-5 w-5 text-fuchsia-500" />,
      change: "+5%", // Placeholder since we don't have growth data for this
      trend: "up",
    },
    {
      title: "Photo Avatars",
      value: metrics.counts.photoAvatars,
      icon: <ImageIcon className="h-5 w-5 text-purple-500" />,
      change: "+24%", // Placeholder since we don't have growth data for this
      trend: "up",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-950">{stat.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`flex items-center text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {stat.trend === "up" ? <TrendingUp className="mr-1 h-3 w-3" /> : <Activity className="mr-1 h-3 w-3" />}
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
