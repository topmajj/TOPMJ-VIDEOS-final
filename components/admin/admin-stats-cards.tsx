import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Video, Mic, ImageIcon, TrendingUp, Activity } from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  change: string
  trend: "up" | "down"
}

const defaultStats = [
  {
    title: "Total Users",
    value: 1200,
    icon: <Users className="h-5 w-5 text-purple-500" />,
    change: "+12%",
    trend: "up" as const,
  },
  {
    title: "Total Videos",
    value: 540,
    icon: <Video className="h-5 w-5 text-indigo-500" />,
    change: "+18%",
    trend: "up" as const,
  },
  {
    title: "Voice Clones",
    value: 240,
    icon: <Mic className="h-5 w-5 text-fuchsia-500" />,
    change: "+5%",
    trend: "up" as const,
  },
  {
    title: "Photo Avatars",
    value: 800,
    icon: <ImageIcon className="h-5 w-5 text-purple-500" />,
    change: "+24%",
    trend: "up" as const,
  },
]

export default function AdminStatsCards({ stats = defaultStats }: { stats?: StatCardProps[] }) {
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
