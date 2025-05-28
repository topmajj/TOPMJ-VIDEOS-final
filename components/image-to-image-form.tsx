"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Download, Upload } from "lucide-react"
import { T } from "@/components/translation"
import { getTranslation } from "@/lib/translations"

interface ImageToImageFormProps {
  userId?: string
}

export function ImageToImageForm({ userId }: ImageToImageFormProps) {
  const [prompt, setPrompt] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ url?: string; prompt?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(getTranslation("mediaGeneration.errors.enterPrompt"))
      return
    }

    if (!imageFile) {
      setError(getTranslation("mediaGeneration.errors.uploadImage"))
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("image", imageFile)

      const response = await fetch("/api/runway/image-to-image", {
        method: "POST",
        body: formData,
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
              <Label htmlFor="image">
                <T text="mediaGeneration.imageToImage.uploadImage" />
              </Label>
              <div
                className="flex items-center justify-center border border-dashed rounded-md p-4 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt={getTranslation("mediaGeneration.preview")}
                    className="max-h-[200px] object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <T text="mediaGeneration.imageToImage.clickToUpload" />
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">
                <T text="mediaGeneration.imageToImage.transformationPrompt" />
              </Label>
              <Textarea
                id="prompt"
                placeholder={getTranslation("mediaGeneration.imageToImage.promptPlaceholder")}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim() || !imageFile} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <T text="mediaGeneration.imageToImage.transforming" />
                </>
              ) : (
                <T text="mediaGeneration.imageToImage.transformButton" />
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
                    <T text="mediaGeneration.imageToImage.transformingImage" />
                  </p>
                </div>
              ) : result?.url ? (
                <div className="relative w-full h-full">
                  <img
                    src={result.url || "/placeholder.svg"}
                    alt={result.prompt || getTranslation("mediaGeneration.transformedImage")}
                    className="w-full h-full object-contain"
                  />
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
                    <T text="mediaGeneration.imageToImage.noImageTransformedYet" />
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
