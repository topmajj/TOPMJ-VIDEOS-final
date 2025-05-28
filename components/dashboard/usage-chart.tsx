"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface UsageChartProps {
  data?: Array<{
    name: string
    videos: number
    avatars: number
    voices: number
    photos: number
  }>
}

const defaultData = [
  { name: "Jan 1", videos: 4, avatars: 2, voices: 1, photos: 3 },
  { name: "Jan 5", videos: 3, avatars: 1, voices: 0, photos: 2 },
  { name: "Jan 10", videos: 5, avatars: 0, voices: 2, photos: 1 },
  { name: "Jan 15", videos: 2, avatars: 3, voices: 1, photos: 0 },
  { name: "Jan 20", videos: 6, avatars: 1, voices: 0, photos: 4 },
  { name: "Jan 25", videos: 4, avatars: 0, voices: 1, photos: 2 },
  { name: "Jan 30", videos: 3, avatars: 1, voices: 0, photos: 0 },
]

export function UsageChart({ data = defaultData }: UsageChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
  )
}
