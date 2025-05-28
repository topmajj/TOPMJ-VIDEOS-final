"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function RunMigrationsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const runMigrations = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/run-migrations", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run migrations")
      }

      setResult({
        success: true,
        message: data.message || "Migrations completed successfully",
      })
    } catch (error) {
      console.error("Error running migrations:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to run migrations",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Run Database Migrations</CardTitle>
          <CardDescription>This will create necessary tables and apply migrations to your database.</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">This action will:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            <li>Create the subscriptions table if it doesn't exist</li>
            <li>Set up Row Level Security policies</li>
            <li>Create necessary triggers</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={runMigrations} disabled={loading} className="w-full">
            {loading ? "Running Migrations..." : "Run Migrations"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
