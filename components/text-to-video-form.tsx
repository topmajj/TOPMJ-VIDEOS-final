"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Download } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"
import { T } from "@/components/translation"
import { getTranslation } from "@/lib/translations"

interface TextToVideoFormProps {
  userId?: string
}

export function TextToVideoForm({ userId }: TextToVideoFormProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ url?: string; prompt?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(getTranslation("mediaGeneration.errors.enterPrompt"))
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/runway/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type: "video",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Generation error:", err)
      setError(err instanceof Error ? err.message : getTranslation("mediaGeneration.errors.unknown"))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">
                <T text="mediaGeneration.prompt" />
              </Label>
              <Textarea
                id="prompt"
                placeholder={getTranslation("mediaGeneration.textToVideo.promptPlaceholder")}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px]"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <T text="mediaGeneration.generating" />
                </>
              ) : (
                <T text="mediaGeneration.textToVideo.generateButton" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            <Label className="mb-2">
              <T text="mediaGeneration.result" />
            </Label>
            <div className="flex-1 flex items-center justify-center rounded-md border border-dashed min-h-[300px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    <T text="mediaGeneration.textToVideo.generatingVideo" />
                  </p>
                </div>
              ) : result?.url ? (
                <div className="relative w-full h-full">
                  <VideoPlayer src={result.url} className="w-full h-full" />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => window.open(result.url, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    <T text="mediaGeneration.textToVideo.noVideoYet" />
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
