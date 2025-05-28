"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PlanStat {
  plan: string
  count: number
  percentage: number
}

type SubscriptionStatsProps = {}

export default function SubscriptionStats({}: SubscriptionStatsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PlanStat[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/subscriptions/stats")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setStats(result.data.plans)
          setTotal(result.data.total)
        } else {
          throw new Error(result.error || "Failed to fetch subscription stats")
        }
      } catch (err) {
        console.error("Failed to fetch subscription stats:", err)
        setError("Failed to load subscription data")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Define colors for different plans
  const planColors = {
    basic: "bg-purple-500",
    pro: "bg-indigo-500",
    business: "bg-fuchsia-500",
    enterprise: "bg-gray-500",
  }

  if (loading) {
    return <Skeleton className="h-[160px] w-full" />
  }

  if (error) {
    return <div className="text-center text-sm text-red-500 py-10">{error}</div>
  }

  if (total === 0) {
    return <div className="text-center text-sm text-muted-foreground py-10">No active subscriptions found</div>
  }

  return (
    <div className="flex flex-col gap-2">
      {stats.map((stat) => (
        <div key={stat.plan} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${planColors[stat.plan as keyof typeof planColors] || "bg-blue-500"}`}
            ></div>
            <span className="text-sm capitalize">{stat.plan}</span>
          </div>
          <span className="text-sm font-medium">{stat.percentage}%</span>
        </div>
      ))}
    </div>
  )
}
