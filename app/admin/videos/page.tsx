import { Suspense } from "react"
import type { Metadata } from "next"

import { Skeleton } from "@/components/ui/skeleton"
import AdminVideosContent from "@/components/admin/admin-videos-content"

export const metadata: Metadata = {
  title: "Admin Videos | AI Videos",
  description: "Manage all videos on the platform",
}

export const dynamic = "force-dynamic"

export default function AdminVideosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Management</h1>
        <p className="text-muted-foreground">View and manage all videos on the platform</p>
      </div>

      <Suspense fallback={<VideosSkeleton />}>
        <AdminVideosContent />
      </Suspense>
    </div>
  )
}

function VideosSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <Skeleton className="h-10 w-full md:w-[300px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="rounded-md border">
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  )
}
