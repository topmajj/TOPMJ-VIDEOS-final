"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminUsersTable from "@/components/admin/admin-users-table"
import { useToast } from "@/components/ui/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function AdminUsersContent() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Initialize state from URL params
  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1")
    const filter = searchParams.get("filter") || "all"
    const search = searchParams.get("search") || ""

    setPagination((prev) => ({ ...prev, page }))
    setActiveTab(filter)
    setSearchTerm(search)
    setDebouncedSearch(search)
  }, [searchParams])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (pagination.page !== 1) params.set("page", pagination.page.toString())
    if (activeTab !== "all") params.set("filter", activeTab)
    if (debouncedSearch) params.set("search", debouncedSearch)

    const newUrl = params.toString() ? `?${params.toString()}` : ""
    router.push(`/admin/users${newUrl}`, { scroll: false })
  }, [pagination.page, activeTab, debouncedSearch, router])

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set("page", pagination.page.toString())
        params.set("pageSize", pagination.pageSize.toString())
        params.set("filter", activeTab)
        if (debouncedSearch) params.set("search", debouncedSearch)

        const response = await fetch(`/api/admin/users?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setUsers(data.users)
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
        })
      } catch (err: any) {
        setError(err.message || "Failed to fetch users")
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [pagination.page, pagination.pageSize, activeTab, debouncedSearch, toast])

  // Handle user updates
  const handleUserUpdated = async () => {
    // Refetch users
    const params = new URLSearchParams()
    params.set("page", pagination.page.toString())
    params.set("pageSize", pagination.pageSize.toString())
    params.set("filter", activeTab)
    if (debouncedSearch) params.set("search", debouncedSearch)

    const response = await fetch(`/api/admin/users?${params.toString()}`)

    if (response.ok) {
      const data = await response.json()
      setUsers(data.users)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search users..."
          className="md:w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setActiveTab("all")
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
          >
            Reset Filters
          </Button>
          <Button variant="outline" onClick={() => handleUserUpdated()}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
          <TabsTrigger value="recent">Recently Joined</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" && "All Users"}
                {activeTab === "admins" && "Administrators"}
                {activeTab === "recent" && "Recently Joined"}
                {activeTab === "inactive" && "Inactive Users"}
              </CardTitle>
              <CardDescription>
                {activeTab === "all" && "Manage all users registered on the platform"}
                {activeTab === "admins" && "Manage users with administrative privileges"}
                {activeTab === "recent" && "Users who joined in the last 30 days"}
                {activeTab === "inactive" && "Users who haven't been active recently"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">{error}</div>
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
              ) : (
                <>
                  <AdminUsersTable users={users} onUserUpdated={handleUserUpdated} />

                  {pagination.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (pagination.page > 1) {
                                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                                }
                              }}
                              className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>

                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              // Show current page, first, last, and pages around current
                              return (
                                page === 1 || page === pagination.totalPages || Math.abs(page - pagination.page) <= 1
                              )
                            })
                            .map((page, i, arr) => (
                              <PaginationItem key={page}>
                                {i > 0 && arr[i - 1] !== page - 1 ? (
                                  <PaginationItem>
                                    <span className="px-4">...</span>
                                  </PaginationItem>
                                ) : null}
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setPagination((prev) => ({ ...prev, page }))
                                  }}
                                  isActive={page === pagination.page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (pagination.page < pagination.totalPages) {
                                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                                }
                              }}
                              className={
                                pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
