"use client"

import { useTheme } from "next-themes"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Week 1", views: 400, shares: 240, engagement: 180 },
  { name: "Week 2", views: 300, shares: 139, engagement: 220 },
  { name: "Week 3", views: 500, shares: 380, engagement: 250 },
  { name: "Week 4", views: 420, shares: 220, engagement: 210 },
  { name: "Week 5", views: 580, shares: 250, engagement: 300 },
  { name: "Week 6", views: 620, shares: 320, engagement: 380 },
]

export function VideoMetrics() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" name="Views" />
        <Area
          type="monotone"
          dataKey="shares"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorShares)"
          name="Shares"
        />
        <Area
          type="monotone"
          dataKey="engagement"
          stroke="#8b5cf6"
          fillOpacity={1}
          fill="url(#colorEngagement)"
          name="Engagement"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
