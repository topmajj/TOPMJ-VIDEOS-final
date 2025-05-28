"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { T } from "@/components/t"
import { getTranslation } from "@/lib/translations"

interface VeoGeneration {
  id: string
  prompt: string
  aspectRatio: string
  status: "processing" | "completed" | "failed"
  videoUrl?: string
  createdAt: string
  operationId?: string
}

export default function AdvancedTextToVideoPage() {
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generations, setGenerations] = useState<VeoGeneration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { language } = useLanguage()

  const t = (key: string) => getTranslation(key, language)

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      const response = await fetch("/api/veo/generations")
      if (response.ok) {
        const data = await response.json()
        setGenerations(data.generations || [])
      }
    } catch (error) {
      console.error("Failed to fetch generations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateVideo = async () => {
    if (!prompt.trim()) {
      toast({
        title: t("advancedTextToVideo.errors.enterPrompt"),
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/veo/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video")
      }

      toast({
        title: t("advancedTextToVideo.success.generationStarted"),
        description: t("advancedTextToVideo.success.generationStartedDescription"),
      })

      // Add the new generation to the list
      const newGeneration: VeoGeneration = {
        id: data.id,
        prompt,
        aspectRatio,
        status: "processing",
        createdAt: new Date().toISOString(),
        operationId: data.operationId,
      }

      setGenerations((prev) => [newGeneration, ...prev])
      setPrompt("")
    } catch (error) {
      console.error("Generation failed:", error)
      toast({
        title: t("advancedTextToVideo.errors.failedToGenerate"),
        description: error instanceof Error ? error.message : t("advancedTextToVideo.errors.unknown"),
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const refreshStatus = async (generation: VeoGeneration) => {
    if (!generation.operationId) return

    try {
      const response = await fetch(`/api/veo/status/${generation.operationId}`)
      const data = await response.json()

      if (response.ok) {
        setGenerations((prev) =>
          prev.map((gen) =>
            gen.id === generation.id ? { ...gen, status: data.status, videoUrl: data.videoUrl } : gen,
          ),
        )

        if (data.status === "completed") {
          toast({
            title: t("advancedTextToVideo.success.generationComplete"),
            description: t("advancedTextToVideo.success.generationCompleteDescription"),
          })
        }
      }
    } catch (error) {
      console.error("Failed to refresh status:", error)
    }
  }

  const deleteGeneration = async (id: string) => {
    try {
      const response = await fetch(`/api/veo/generations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setGenerations((prev) => prev.filter((gen) => gen.id !== id))
        toast({
          title: t("advancedTextToVideo.success.deleted"),
        })
      }
    } catch (error) {
      console.error("Failed to delete generation:", error)
      toast({
        title: t("advancedTextToVideo.errors.failedToDelete"),
        variant: "destructive",
      })
    }
  }

  const downloadVideo = async (videoUrl: string, prompt: string) => {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `veo-video-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: t("advancedTextToVideo.download.started"),
        description: t("advancedTextToVideo.download.description"),
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: t("advancedTextToVideo.errors.failedToDownload"),
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">{t("advancedTextToVideo.status.completed")}</Badge>
      case "processing":
        return <Badge variant="secondary">{t("advancedTextToVideo.status.processing")}</Badge>
      case "failed":
        return <Badge variant="destructive">{t("advancedTextToVideo.status.failed")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">
          <T text="advancedTextToVideo.loading" />
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <T text="advancedTextToVideo.title" />
        </h1>
        <p className="text-muted-foreground">
          <T text="advancedTextToVideo.description" />
        </p>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            <T text="advancedTextToVideo.createNew" />
          </CardTitle>
          <CardDescription>
            <T text="advancedTextToVideo.createDescription" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">
              <T text="advancedTextToVideo.prompt" />
            </Label>
            <Textarea
              id="prompt"
              placeholder={t("advancedTextToVideo.promptPlaceholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              {prompt.length}/500 <T text="advancedTextToVideo.characters" />
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aspectRatio">
              <T text="advancedTextToVideo.aspectRatio" />
            </Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateVideo} disabled={isGenerating || !prompt.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <T text="advancedTextToVideo.generating" />
              </>
            ) : (
              <T text="advancedTextToVideo.generateButton" />
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generations List */}
      <Card>
        <CardHeader>
          <CardTitle>
            <T text="advancedTextToVideo.yourGenerations" />
          </CardTitle>
          <CardDescription>
            <T text="advancedTextToVideo.yourGenerationsDescription" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                <T text="advancedTextToVideo.noGenerations" />
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <T text="advancedTextToVideo.createFirstVideo" />
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {generations.map((generation) => (
                <div key={generation.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{generation.prompt}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>{generation.aspectRatio}</span>
                        <span>•</span>
                        <span>{new Date(generation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">{getStatusBadge(generation.status)}</div>
                  </div>

                  {generation.videoUrl && generation.status === "completed" && (
                    <div className="space-y-2">
                      <video
                        src={generation.videoUrl}
                        controls
                        className="w-full max-w-md rounded-lg"
                        poster="/placeholder.svg?height=200&width=300&text=Video+Preview"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {generation.status === "processing" && (
                      <Button variant="outline" size="sm" onClick={() => refreshStatus(generation)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <T text="advancedTextToVideo.refreshStatus" />
                      </Button>
                    )}

                    {generation.videoUrl && generation.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadVideo(generation.videoUrl!, generation.prompt)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <T text="advancedTextToVideo.download" />
                      </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={() => deleteGeneration(generation.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      <T text="advancedTextToVideo.delete" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
