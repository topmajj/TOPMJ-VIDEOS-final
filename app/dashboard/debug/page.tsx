"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DebugPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Debug</h1>
        <p className="text-muted-foreground">Test the HeyGen API connection</p>
      </div>

      <Tabs defaultValue="direct">
        <TabsList>
          <TabsTrigger value="direct">API Test</TabsTrigger>
          <TabsTrigger value="env">Environment</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-4">
          <ApiTester
            title="Test HeyGen API"
            description="Test the HeyGen API implementation"
            endpoints={[
              { label: "List Avatars", value: "/api/heygen/avatars" },
              { label: "List Voices", value: "/api/heygen/voices" },
              { label: "Direct Proxy", value: "/api/heygen/direct-proxy?endpoint=/v2/avatars" },
            ]}
          />
        </TabsContent>

        <TabsContent value="env" className="space-y-4">
          <EnvVarChecker />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced API Testing</CardTitle>
              <CardDescription>Test with different timeouts and retry strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => window.open("/api/heygen/direct-proxy?endpoint=/v2/avatars", "_blank")}
                  className="w-full"
                >
                  Test Direct Proxy (New Tab)
                </Button>
                <Button onClick={() => window.open("/api/heygen/avatars", "_blank")} className="w-full">
                  Test Avatars API (New Tab)
                </Button>
                <Button onClick={() => window.open("/api/heygen/voices", "_blank")} className="w-full">
                  Test Voices API (New Tab)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ApiTester({
  title,
  description,
  endpoints,
}: {
  title: string
  description: string
  endpoints: { label: string; value: string }[]
}) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [endpoint, setEndpoint] = useState(endpoints[0].value)
  const [attempts, setAttempts] = useState(0)

  const testApi = async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)
      setAttempts(0)

      // Try up to 3 times
      for (let attempt = 1; attempt <= 3; attempt++) {
        setAttempts(attempt)

        try {
          console.log(`API test attempt ${attempt}...`)
          const response = await fetch(endpoint)

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
          }

          const data = await response.json()

          if (data.error) {
            throw new Error(data.error)
          }

          setResults(data)
          break // Success, exit the loop
        } catch (err) {
          console.error(`Attempt ${attempt} failed:`, err)

          if (attempt === 3) {
            // Last attempt failed
            throw err
          }

          // Wait before next attempt
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    } catch (err: any) {
      console.error("All API test attempts failed:", err)
      setError(err.message || "Failed to test API after multiple attempts")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="endpoint">API Endpoint</Label>
          <select
            id="endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {endpoints.map((ep) => (
              <option key={ep.value} value={ep.value}>
                {ep.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <Alert variant="default" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              <p>API request completed in {results.timing?.totalTime}</p>
              {results.timing?.attempts && <p>Successful after {results.timing.attempts} attempt(s)</p>}
              <div className="mt-2 max-h-96 overflow-auto rounded border p-2 bg-background">
                <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testApi} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing... (Attempt {attempts}/3)
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test API
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function EnvVarChecker() {
  const [loading, setLoading] = useState(true)
  const [envData, setEnvData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkEnvVars = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/heygen/env-check")

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      setEnvData(data)
    } catch (err: any) {
      console.error("Error checking environment variables:", err)
      setError(err.message || "Failed to check environment variables")
    } finally {
      setLoading(false)
    }
  }

  // Check environment variables on component mount
  useEffect(() => {
    checkEnvVars()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
        <CardDescription>Check if the API key is configured</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Checking environment variables...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">HEYGEN_API_KEY</p>
                <p className="text-sm text-muted-foreground">
                  {envData?.serverKeyExists ? `Configured (${envData.serverKeyPreview})` : "Not configured"}
                </p>
              </div>
              {envData?.serverKeyExists ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <Button onClick={checkEnvVars} disabled={loading} variant="outline" className="w-full mt-4">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
