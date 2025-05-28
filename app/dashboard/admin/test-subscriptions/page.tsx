"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function TestSubscriptionsPage() {
  const [planId, setPlanId] = useState("basic")
  const [loading, setLoading] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const { toast } = useToast()

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/subscriptions")
      const data = await response.json()
      setDebugData(data)
      toast({
        title: "Debug data fetched",
        description: "Check the console for details",
      })
      console.log("Subscription debug data:", data)
    } catch (error) {
      console.error("Error fetching debug data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch debug data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createTestSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create test subscription")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Test subscription created successfully!",
      })
      console.log("Created subscription:", data)
    } catch (error) {
      console.error("Error creating test subscription:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test subscription",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Subscription Testing</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Subscriptions</CardTitle>
            <CardDescription>Check the current state of subscriptions in the database</CardDescription>
          </CardHeader>
          <CardContent>
            {debugData && (
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                <pre>{JSON.stringify(debugData, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={fetchDebugData} disabled={loading}>
              {loading ? "Loading..." : "Fetch Debug Data"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Test Subscription</CardTitle>
            <CardDescription>Create a test subscription for the current user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="plan" className="text-sm font-medium">
                  Plan
                </label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger id="plan" className="col-span-3">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={createTestSubscription} disabled={loading}>
              {loading ? "Creating..." : "Create Test Subscription"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
