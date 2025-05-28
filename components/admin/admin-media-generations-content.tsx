"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Search, Filter } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import AdminMediaGenerationsTable from "@/components/admin/admin-media-generations-table"

export default function AdminMediaGenerationsContent() {
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [generations, setGenerations] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // Initialize state from URL params
  useEffect(() => {
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10
    const status = searchParams.get("status") || "all"
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    setPage(page)
    setLimit(limit)
    setStatus(status)
    setSearchQuery(search)
    setDebouncedSearchQuery(search)
    setSortBy(sortBy)
    setSortOrder(sortOrder)
  }, [searchParams])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", limit.toString())
    params.set("status", status)
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)

    router.push(`${pathname}?${params.toString()}`)
  }, [page, limit, status, debouncedSearchQuery, sortBy, sortOrder, pathname, router])

  // Fetch generations
  useEffect(() => {
    const fetchGenerations = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", page.toString())
        params.set("limit", limit.toString())
        params.set("status", status)
        if (debouncedSearchQuery) params.set("search", debouncedSearchQuery)
        params.set("sortBy", sortBy)
        params.set("sortOrder", sortOrder)

        const response = await fetch(`/api/admin/runway-generations?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Error fetching generations: ${response.statusText}`)
        }

        const data = await response.json()
        setGenerations(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching generations:", error)
        toast({
          title: "Error",
          description: `${error}`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGenerations()
  }, [page, limit, status, debouncedSearchQuery, sortBy, sortOrder, toast])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1) // Reset to first page when changing filters
  }

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
    setPage(1) // Reset to first page when changing sort
  }

  const handleDeleteGeneration = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/runway-generations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting generation: ${response.statusText}`)
      }

      // Remove the deleted generation from the state
      setGenerations(generations.filter((gen) => gen.id !== id))
      setTotal(total - 1)

      toast({
        title: "Success",
        description: "Media generation deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting generation:", error)
      toast({
        title: "Error",
        description: `${error}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Media Generations</h1>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search generations..."
              className="w-full pl-8 sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AdminMediaGenerationsTable
        generations={generations}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onDelete={handleDeleteGeneration}
      />
    </div>
  )
}
