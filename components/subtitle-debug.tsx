"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { parseSRT, parseHappyScribeJSON, parseHappyScribeWordsJSON, type SubtitleCue } from "@/lib/srt-parser"

interface SubtitleDebugProps {
  subtitleUrl: string
  videoUrl: string
}

export function SubtitleDebug({ subtitleUrl, videoUrl }: SubtitleDebugProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [rawContent, setRawContent] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [parsedSRT, setParsedSRT] = useState<SubtitleCue[]>([])
  const [parsedJSON, setParsedJSON] = useState<SubtitleCue[]>([])
  const [parsedWordsJSON, setParsedWordsJSON] = useState<SubtitleCue[]>([])
  const [contentType, setContentType] = useState<string>("")

  useEffect(() => {
    async function fetchSubtitles() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(subtitleUrl)
        const contentTypeHeader = response.headers.get("content-type") || ""
        setContentType(contentTypeHeader)

        const content = await response.text()
        setRawContent(content)

        // Try parsing as SRT
        try {
          const srtResult = parseSRT(content)
          setParsedSRT(srtResult)
        } catch (e) {
          console.error("SRT parsing error:", e)
        }

        // Try parsing as JSON
        try {
          const jsonData = JSON.parse(content)
          const jsonResult = parseHappyScribeJSON(jsonData)
          setParsedJSON(jsonResult)

          const wordsResult = parseHappyScribeWordsJSON(jsonData)
          setParsedWordsJSON(wordsResult)
        } catch (e) {
          console.error("JSON parsing error:", e)
        }
      } catch (err) {
        console.error("Error fetching subtitles:", err)
        setError(`Failed to fetch subtitles: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (subtitleUrl) {
      fetchSubtitles()
    }
  }, [subtitleUrl])

  const fixAndDownloadSRT = () => {
    // Choose the best parsed result
    const subtitles = parsedSRT.length > 0 ? parsedSRT : parsedJSON.length > 0 ? parsedJSON : parsedWordsJSON

    if (subtitles.length === 0) {
      alert("No valid subtitles found to convert")
      return
    }

    // Convert to SRT format
    let srtContent = ""
    subtitles.forEach((cue, index) => {
      const startTime = formatSRTTime(cue.startTime)
      const endTime = formatSRTTime(cue.endTime)

      srtContent += `${index + 1}\n`
      srtContent += `${startTime} --> ${endTime}\n`
      srtContent += `${cue.text}\n\n`
    })

    // Create and download file
    const blob = new Blob([srtContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "fixed-subtitles.srt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p className="font-medium">Error loading subtitles</p>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subtitle Debug</CardTitle>
        <div className="text-sm text-muted-foreground">Content-Type: {contentType || "Unknown"}</div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="raw">
          <TabsList className="mb-4">
            <TabsTrigger value="raw">Raw Content</TabsTrigger>
            <TabsTrigger value="srt">SRT Parser ({parsedSRT.length})</TabsTrigger>
            <TabsTrigger value="json">JSON Parser ({parsedJSON.length})</TabsTrigger>
            <TabsTrigger value="words">Words Parser ({parsedWordsJSON.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="space-y-4">
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{rawContent || "No content"}</pre>
            </div>
          </TabsContent>

          <TabsContent value="srt" className="space-y-4">
            {parsedSRT.length > 0 ? (
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                {parsedSRT.map((cue) => (
                  <div key={cue.id} className="mb-2 p-2 border-b border-gray-200">
                    <div className="text-sm font-medium">
                      {formatSRTTime(cue.startTime)} → {formatSRTTime(cue.endTime)}
                    </div>
                    <div>{cue.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No subtitles parsed with SRT parser</p>
            )}
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            {parsedJSON.length > 0 ? (
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                {parsedJSON.map((cue) => (
                  <div key={cue.id} className="mb-2 p-2 border-b border-gray-200">
                    <div className="text-sm font-medium">
                      {formatSRTTime(cue.startTime)} → {formatSRTTime(cue.endTime)}
                    </div>
                    <div>{cue.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No subtitles parsed with JSON parser</p>
            )}
          </TabsContent>

          <TabsContent value="words" className="space-y-4">
            {parsedWordsJSON.length > 0 ? (
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                {parsedWordsJSON.map((cue) => (
                  <div key={cue.id} className="mb-2 p-2 border-b border-gray-200">
                    <div className="text-sm font-medium">
                      {formatSRTTime(cue.startTime)} → {formatSRTTime(cue.endTime)}
                    </div>
                    <div>{cue.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No subtitles parsed with Words JSON parser</p>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex gap-2">
          <Button onClick={fixAndDownloadSRT}>Download Fixed SRT</Button>
          <Button variant="outline" asChild>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              Open Video
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
