"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function ImageToVideoForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [promptText, setPromptText] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState("5")
  const [ratio, setRatio] = useState("1280:768")
  const [error, setError] = useState<string | null>(null)
  // Always use SDK approach
  const apiMethod = "sdk"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!promptText.trim()) {
      setError("Please enter a prompt text")
      return
    }

    if (!selectedImage) {
      setError("Please select an image")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("promptText", promptText)
      formData.append("image", selectedImage)
      formData.append("duration", duration)
      formData.append("ratio", ratio)

      console.log("Submitting form data:", {
        promptText,
        imageFile: selectedImage.name,
        duration,
        ratio,
        apiMethod,
      })

      // Always use the SDK endpoint
      const endpoint = "/api/runway/image-to-video-sdk"

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video")
      }

      toast({
        title: "Video generation started",
        description: "Your video is being generated. Check the generations tab to see the result.",
      })

      // Reset form
      setPromptText("")
      setSelectedImage(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Error generating video:", error)
      setError(error.message || "An error occurred while generating the video")
      toast({
        title: "Error",
        description: error.message || "An error occurred while generating the video",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Video from Image</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="promptText">Prompt Text</Label>
            <Textarea
              id="promptText"
              placeholder="Describe what should appear in the video..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Upload Image</Label>
            <Input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-h-[200px] rounded-md object-contain"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Select value={duration} onValueChange={setDuration} disabled={isLoading}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratio">Aspect Ratio</Label>
              <Select value={ratio} onValueChange={setRatio} disabled={isLoading}>
                <SelectTrigger id="ratio">
                  <SelectValue placeholder="Select ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1280:768">Landscape (1280:768)</SelectItem>
                  <SelectItem value="768:1280">Portrait (768:1280)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Video"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Videos are generated using Runway's Gen-3 AI model.
      </CardFooter>
    </Card>
  )
}
