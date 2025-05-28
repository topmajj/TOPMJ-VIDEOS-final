"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, Download, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import AdminVideosTable from "@/components/admin/admin-videos-table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface Video {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  duration: number | null
  status: string
  created_at: string
  updated_at: string | null
  avatar_id: string | null
  voice_id: string | null
  script: string | null
  heygen_video_id: string | null
  user_id: string
  user?: User
}

export default function AdminVideosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get query parameters
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || "all"
  const sortBy = searchParams.get("sortBy") || "created_at"
  const sortOrder = searchParams.get("sortOrder") || "desc"

  // State
  const [videos, setVideos] = useState<Video[]>([])
  const [totalVideos, setTotalVideos] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [activeTab, setActiveTab] = useState(status)

  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        })

        if (search) queryParams.set("search", search)
        if (status && status !== "all") queryParams.set("status", status)

        const response = await fetch(`/api/admin/videos?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error(`Error fetching videos: ${response.statusText}`)
        }

        const data = await response.json()
        setVideos(data.videos)
        setTotalVideos(data.total)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching videos:", error)
        toast({
          title: "Error",
          description: "Failed to load videos. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [page, limit, search, status, sortBy, sortOrder, toast])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateQueryParams({ search: searchInput, page: "1" })
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    updateQueryParams({ status: value, page: "1" })
  }

  // Update query parameters
  const updateQueryParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    router.push(`/admin/videos?${newParams.toString()}`)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    updateQueryParams({ page: newPage.toString() })
  }

  // Handle video deletion
  const handleDeleteVideo = async (videoId: string) => {
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting video: ${response.statusText}`)
      }

      // Remove the deleted video from the state
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId))
      setTotalVideos((prev) => prev - 1)

      toast({
        title: "Video deleted",
        description: "The video has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting video:", error)
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Generate pagination items
  const paginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationLink
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(page - 1)
          }}
          isActive={false}
          disabled={page === 1}
        >
          Previous
        </PaginationLink>
      </PaginationItem>,
    )

    // Calculate range of pages to show
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(1)
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Ellipsis if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <span className="px-4 py-2">...</span>
          </PaginationItem>,
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(i)
            }}
            isActive={i === page}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis2">
          <span className="px-4 py-2">...</span>
        </PaginationItem>,
      )
    }

    // Last page
    if (endPage < totalPages) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(totalPages)
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationLink
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(page + 1)
          }}
          isActive={false}
          disabled={page === totalPages}
        >
          Next
        </PaginationLink>
      </PaginationItem>,
    )

    return items
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Videos</h2>
          <p className="text-muted-foreground">
            {totalVideos} {totalVideos === 1 ? "video" : "videos"} found
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700">
          <Plus className="mr-2 h-4 w-4" /> Create Video
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <form onSubmit={handleSearch} className="flex w-full gap-2 md:w-[300px]">
          <Input
            placeholder="Search videos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => updateQueryParams({ sortBy: value, page: "1" })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="updated_at">Updated Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value) => updateQueryParams({ sortOrder: value, page: "1" })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort order</SelectLabel>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Videos</CardTitle>
              <CardDescription>Manage all videos created on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminVideosTable videos={videos} loading={loading} onDelete={handleDeleteVideo} />

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>{paginationItems()}</PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Videos</CardTitle>
              <CardDescription>Videos that have been successfully processed</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminVideosTable videos={videos} loading={loading} onDelete={handleDeleteVideo} />

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>{paginationItems()}</PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing Videos</CardTitle>
              <CardDescription>Videos that are currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminVideosTable videos={videos} loading={loading} onDelete={handleDeleteVideo} />

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>{paginationItems()}</PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Videos</CardTitle>
              <CardDescription>Videos that failed during processing</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminVideosTable videos={videos} loading={loading} onDelete={handleDeleteVideo} />

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>{paginationItems()}</PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
