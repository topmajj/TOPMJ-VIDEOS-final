"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartData {
  name: string
  videos: number
  avatars: number
  voices: number
  photos: number
}

export default function AdminUsageChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/analytics/usage")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setChartData(result.data)
        } else {
          throw new Error(result.error || "Failed to fetch usage data")
        }
      } catch (err) {
        console.error("Failed to fetch usage data:", err)
        setError("Failed to load usage analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>Platform usage over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>Platform usage over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex items-center justify-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Analytics</CardTitle>
        <CardDescription>Platform usage over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              stroke={isDark ? "#666" : "#888"}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke={isDark ? "#666" : "#888"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#fff",
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                borderRadius: "6px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                color: isDark ? "#f3f4f6" : "#1f2937",
              }}
            />
            <Bar dataKey="videos" name="Videos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avatars" name="Avatars" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="voices" name="Voices" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="photos" name="Photos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
