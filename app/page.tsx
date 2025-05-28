"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Image, Mic, TrendingUp, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UsageChart } from "@/components/dashboard/usage-chart"
import { VideoMetrics } from "@/components/dashboard/video-metrics"
import { RecentVideos } from "@/components/dashboard/recent-videos"

function DashboardContent() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your HeyGen dashboard. Monitor your usage and recent activity.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Videos"
            value="24"
            description="+4 from last week"
            trend="up"
            icon={<Video className="h-4 w-4" />}
          />
          <MetricCard
            title="Avatars"
            value="8"
            description="2 new this month"
            trend="up"
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            title="Voice Clones"
            value="5"
            description="No change"
            trend="neutral"
            icon={<Mic className="h-4 w-4" />}
          />
          <MetricCard
            title="Talking Photos"
            value="12"
            description="+3 from last week"
            trend="up"
            icon={<Image className="h-4 w-4" />}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Usage Overview</CardTitle>
                  <CardDescription>Your API usage over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <UsageChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>Recent Videos</CardTitle>
                    <CardDescription>Your latest video creations</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View all
                  </Button>
                </CardHeader>
                <CardContent>
                  <RecentVideos />
                </CardContent>
              </Card>
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Video Metrics</CardTitle>
                  <CardDescription>Performance of your recent videos</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <VideoMetrics />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Analytics Dashboard</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Detailed analytics will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>Monitor your API usage and quotas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Video Generation</span>
                      </div>
                      <span className="text-sm text-muted-foreground">24/100 credits</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[24%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Avatar Creation</span>
                      </div>
                      <span className="text-sm text-muted-foreground">8/20 credits</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[40%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Voice Cloning</span>
                      </div>
                      <span className="text-sm text-muted-foreground">5/10 credits</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[50%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Talking Photos</span>
                      </div>
                      <span className="text-sm text-muted-foreground">12/50 credits</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[24%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
}: {
  title: string
  value: string
  description: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === "up" && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
          {trend === "down" && <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, isLoading, router])

  // Show a loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (user) {
    return <DashboardContent />
  }

  return null
}
