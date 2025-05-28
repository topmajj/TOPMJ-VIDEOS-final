"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import AdminTransactionsTable from "./admin-transactions-table"
import { CreditCard, ArrowDownCircle, ArrowUpCircle } from "lucide-react"

export default function AdminSubscriptionsContent() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    purchases: 0,
    usage: 0,
  })

  const fetchTransactions = async (page = 1, type = "") => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
        search: searchQuery,
        type,
      })

      const response = await fetch(`/api/admin/transactions?${params}`)

      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`)
      }

      const data = await response.json()
      setTransactions(data.transactions)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total count
      const totalResponse = await fetch("/api/admin/transactions?pageSize=1")
      const totalData = await totalResponse.json()

      // Get purchases count
      const purchasesResponse = await fetch("/api/admin/transactions?pageSize=1&type=purchase")
      const purchasesData = await purchasesResponse.json()

      // Get usage count
      const usageResponse = await fetch("/api/admin/transactions?pageSize=1&type=usage")
      const usageData = await usageResponse.json()

      setStats({
        total: totalData.total || 0,
        purchases: purchasesData.total || 0,
        usage: usageData.total || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchTransactions(1, activeTab === "all" ? "" : activeTab)
    fetchStats()
  }, [activeTab])

  const handlePageChange = (page: number) => {
    fetchTransactions(page, activeTab === "all" ? "" : activeTab)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTransactions(1, activeTab === "all" ? "" : activeTab)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All transactions in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.purchases}</div>
            <p className="text-xs text-muted-foreground">Credit purchases and subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usage}</div>
            <p className="text-xs text-muted-foreground">Credit usage transactions</p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="search"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="purchase">Purchases</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <AdminTransactionsTable
            transactions={transactions}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        <TabsContent value="purchase" className="space-y-4">
          <AdminTransactionsTable
            transactions={transactions}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        <TabsContent value="usage" className="space-y-4">
          <AdminTransactionsTable
            transactions={transactions}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
