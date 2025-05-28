"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, ImageIcon, Mic, TrendingUp, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UsageChart } from "@/components/dashboard/usage-chart"
import { VideoMetrics } from "@/components/dashboard/video-metrics"
import { RecentVideos } from "@/components/dashboard/recent-videos"
import { Skeleton } from "@/components/ui/skeleton"
import { T } from "@/components/t"
import { useLanguage } from "@/lib/language-context"

// Translations object for direct access
const translations = {
  en: {
    dashboard: {
      recentActivity: {
        title: "Recent Activity",
        description: "Your latest actions and updates",
      },
      recentVideos: {
        title: "Recent Videos",
        description: "Your latest video creations",
        viewAll: "View all",
      },
      videoMetrics: {
        title: "Video Metrics",
        description: "Performance of your recent videos",
      },
    },
  },
  ar: {
    dashboard: {
      recentActivity: {
        title: "النشاط الأخير",
        description: "أحدث الإجراءات والتحديثات الخاصة بك",
      },
      recentVideos: {
        title: "الفيديوهات الأخيرة",
        description: "أحدث إنشاءات الفيديو الخاصة بك",
        viewAll: "عرض الكل",
      },
      videoMetrics: {
        title: "مقاييس الفيديو",
        description: "أداء مقاطع الفيديو الأخيرة الخاصة بك",
      },
    },
  },
}

// Translation helper function
function getLocalTranslation(key: string, language: "en" | "ar") {
  const keys = key.split(".")
  let result: any = translations[language]

  for (const k of keys) {
    if (result && result[k]) {
      result = result[k]
    } else {
      return key // Fallback to key if translation not found
    }
  }

  return result
}

// Loading component for metrics
function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-24" />
        </CardTitle>
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { language } = useLanguage()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Local translation function
  const t = (key: string) => getLocalTranslation(key, language)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch(`/api/dashboard/metrics`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error fetching dashboard metrics: ${response.status}`)
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <T text="dashboard.title" />
          </h1>
          <p className="text-muted-foreground">
            <T text="dashboard.welcomePrefix" /> TopMaj <T text="dashboard.welcomeSuffix" />
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        <div className="h-[600px] rounded-md border border-dashed flex items-center justify-center">
          <p className="text-muted-foreground">
            <T text="dashboard.loading" />
          </p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <T text="dashboard.title" />
          </h1>
          <p className="text-muted-foreground">
            <T text="dashboard.welcome" />
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <T text="dashboard.errorTitle" />
            </CardTitle>
            <CardDescription>
              <T text="dashboard.errorDescription" />
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { metrics, usageData, recentActivity, recentVideos } = dashboardData

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <T text="dashboard.title" />
        </h1>
        <p className="text-muted-foreground">
          <T text="dashboard.welcomePrefix" />{" "}
          <span className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-medium">
            TopMaj
          </span>{" "}
          <T text="dashboard.welcomeSuffix" />
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={<T text="dashboard.metrics.videos.title" />}
          value={metrics.videos.count.toString()}
          description={<T text="dashboard.metrics.videos.fromLastWeek" />}
          trend={metrics.videos.trend}
          icon={<Video className="h-4 w-4" />}
          hideDescription={true}
        />
        <MetricCard
          title={<T text="dashboard.metrics.avatars.title" />}
          value={metrics.avatars.count.toString()}
          description={<T text="dashboard.metrics.avatars.fromLastWeek" />}
          trend={metrics.avatars.trend}
          icon={<Users className="h-4 w-4" />}
          hideDescription={true}
        />
        <MetricCard
          title={<T text="dashboard.metrics.voices.title" />}
          value={metrics.voices.count.toString()}
          description={<T text="dashboard.metrics.voices.fromLastWeek" />}
          trend={metrics.voices.trend}
          icon={<Mic className="h-4 w-4" />}
          hideDescription={true}
        />
        <MetricCard
          title={<T text="dashboard.metrics.photos.title" />}
          value={metrics.photos.count.toString()}
          description={<T text="dashboard.metrics.photos.fromLastWeek" />}
          trend={metrics.photos.trend}
          icon={<ImageIcon className="h-4 w-4" />}
          hideDescription={true}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <T text="dashboard.tabs.overview" />
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <T text="dashboard.tabs.analytics" />
          </TabsTrigger>
          <TabsTrigger value="usage">
            <T text="dashboard.tabs.usage" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>
                  <T text="dashboard.usageOverview.title" />
                </CardTitle>
                <CardDescription>
                  <T text="dashboard.usageOverview.description" />
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <UsageChart data={usageData} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t("dashboard.recentActivity.title")}</CardTitle>
                <CardDescription>{t("dashboard.recentActivity.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={recentActivity} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{t("dashboard.recentVideos.title")}</CardTitle>
                  <CardDescription>{t("dashboard.recentVideos.description")}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  {t("dashboard.recentVideos.viewAll")}
                </Button>
              </CardHeader>
              <CardContent>
                <RecentVideos videos={recentVideos} />
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t("dashboard.videoMetrics.title")}</CardTitle>
                <CardDescription>{t("dashboard.videoMetrics.description")}</CardDescription>
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
              <CardTitle>
                <T text="dashboard.advancedAnalytics.title" />
              </CardTitle>
              <CardDescription>
                <T text="dashboard.advancedAnalytics.description" />
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  <T text="dashboard.advancedAnalytics.dashboardTitle" />
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <T text="dashboard.advancedAnalytics.comingSoon" />
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <T text="dashboard.apiUsage.title" />
              </CardTitle>
              <CardDescription>
                <T text="dashboard.apiUsage.description" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        <T text="dashboard.apiUsage.videoGeneration" />
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      24/100 <T text="dashboard.apiUsage.credits" />
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        <T text="dashboard.apiUsage.avatarCreation" />
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      8/20 <T text="dashboard.apiUsage.credits" />
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        <T text="dashboard.apiUsage.voiceCloning" />
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      5/10 <T text="dashboard.apiUsage.credits" />
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[50%] rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        <T text="dashboard.apiUsage.talkingPhotos" />
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      12/50 <T text="dashboard.apiUsage.credits" />
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  hideDescription = false,
}: {
  title: string | React.ReactNode
  value: string
  description: string | React.ReactNode
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
  hideDescription?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {!hideDescription && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend === "up" && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
            {trend === "down" && <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
