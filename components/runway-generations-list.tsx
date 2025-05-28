"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Trash2, ExternalLink, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { T } from "@/components/translation"
import { getTranslation } from "@/lib/translations"

interface Generation {
  id: string
  prompt: string
  type: string
  output_url: string | null
  input_image_url: string | null
  status: string
  created_at: string
  runway_task_id?: string
}

export function RunwayGenerationsList() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchGenerations = async () => {
    try {
      const response = await fetch("/api/media-generation/generations")
      if (!response.ok) {
        throw new Error(getTranslation("mediaGeneration.errors.failedToFetch"))
      }
      const data = await response.json()
      setGenerations(data.generations || [])
    } catch (error) {
      console.error("Error fetching generations:", error)
      toast({
        title: getTranslation("common.error"),
        description: getTranslation("mediaGeneration.errors.failedToLoad"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGenerations()

    // Set up polling for processing generations
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch("/api/media-generation/generations")
        if (!response.ok) {
          throw new Error(getTranslation("mediaGeneration.errors.failedToFetch"))
        }
        const data = await response.json()
        const processingGenerations = (data.generations || []).filter(
          (gen: Generation) => gen.status === "processing" && gen.runway_task_id,
        )

        // Check status for each processing generation
        for (const gen of processingGenerations) {
          if (gen.runway_task_id) {
            try {
              const statusResponse = await fetch(`/api/runway/task-status/${gen.runway_task_id}`)
              if (statusResponse.ok) {
                // If status check was successful, refresh the list
                await fetchGenerations()
              }
            } catch (error) {
              console.error(`Error checking status for generation ${gen.id}:`, error)
            }
          }
        }
      } catch (error) {
        console.error("Error polling generations:", error)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(intervalId)
  }, [])

  const refreshGenerations = async () => {
    setIsRefreshing(true)
    await fetchGenerations()
  }

  const deleteGeneration = async (id: string) => {
    try {
      const response = await fetch(`/api/media-generation/generations/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(getTranslation("mediaGeneration.errors.failedToDelete"))
      }
      setGenerations((prev) => prev.filter((gen) => gen.id !== id))
      toast({
        title: getTranslation("common.success"),
        description: getTranslation("mediaGeneration.success.deleted"),
      })
    } catch (error) {
      console.error("Error deleting generation:", error)
      toast({
        title: getTranslation("common.error"),
        description: getTranslation("mediaGeneration.errors.failedToDelete"),
        variant: "destructive",
      })
    }
  }

  // Function to handle video download
  const downloadVideo = async (url: string, filename: string) => {
    try {
      // Create a temporary anchor element
      const a = document.createElement("a")
      a.href = url
      a.download = `${filename.replace(/\s+/g, "-").toLowerCase()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: getTranslation("mediaGeneration.download.started"),
        description: getTranslation("mediaGeneration.download.description"),
      })
    } catch (error) {
      console.error("Error downloading video:", error)
      toast({
        title: getTranslation("common.error"),
        description: getTranslation("mediaGeneration.errors.failedToDownload"),
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">
          <T text="mediaGeneration.noGenerations" />
        </h3>
        <p className="text-muted-foreground mb-4">
          <T text="mediaGeneration.createFirstVideo" />
        </p>
        <Button asChild>
          <Link href="/dashboard/media-generation/image-to-video">
            <T text="mediaGeneration.createNew" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          <T text="mediaGeneration.yourGenerations" />
        </h2>
        <Button variant="outline" size="sm" onClick={refreshGenerations} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {isRefreshing ? <T text="mediaGeneration.refreshing" /> : <T text="mediaGeneration.refresh" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((generation) => (
          <Card key={generation.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {generation.status === "processing" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      <T text="mediaGeneration.processing" />
                    </p>
                  </div>
                </div>
              ) : generation.status === "failed" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <p className="text-sm font-medium text-red-500">
                    <T text="mediaGeneration.failed" />
                  </p>
                </div>
              ) : generation.output_url ? (
                generation.type === "video" ? (
                  <video src={generation.output_url} controls className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={generation.output_url || "/placeholder.svg"}
                    alt={generation.prompt}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <p className="text-sm font-medium">
                    <T text="mediaGeneration.noPreview" />
                  </p>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={generation.type === "video" ? "default" : "outline"}>
                  {generation.type === "video" ? (
                    <T text="mediaGeneration.types.video" />
                  ) : (
                    <T text="mediaGeneration.types.image" />
                  )}
                </Badge>
                <Badge
                  variant={
                    generation.status === "completed"
                      ? "default"
                      : generation.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {generation.status === "completed" ? (
                    <T text="mediaGeneration.status.completed" />
                  ) : generation.status === "failed" ? (
                    <T text="mediaGeneration.status.failed" />
                  ) : (
                    <T text="mediaGeneration.status.processing" />
                  )}
                </Badge>
              </div>
              <p className="text-sm line-clamp-2 mb-3">{generation.prompt}</p>
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => deleteGeneration(generation.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> <T text="mediaGeneration.actions.delete" />
                </Button>
                {generation.output_url && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadVideo(generation.output_url!, generation.prompt)}
                    >
                      <Download className="h-4 w-4 mr-1" /> <T text="mediaGeneration.actions.download" />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={generation.output_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" /> <T text="mediaGeneration.actions.open" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
