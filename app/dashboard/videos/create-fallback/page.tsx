"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Sample data for testing
const sampleAvatars = [
  { avatar_id: "avatar1", name: "Business Woman" },
  { avatar_id: "avatar2", name: "Business Man" },
  { avatar_id: "avatar3", name: "Casual Presenter" },
]

const sampleVoices = [
  { voice_id: "voice1", name: "Emma", language: "English (US)", gender: "Female" },
  { voice_id: "voice2", name: "John", language: "English (US)", gender: "Male" },
  { voice_id: "voice3", name: "Sophie", language: "English (UK)", gender: "Female" },
]

export default function CreateVideoFallbackPage() {
  const [selectedAvatar, setSelectedAvatar] = useState(sampleAvatars[0].avatar_id)
  const [selectedVoice, setSelectedVoice] = useState(sampleVoices[0].voice_id)
  const [script, setScript] = useState("")
  const [speed, setSpeed] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!script.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Success",
        description: "Video creation started successfully!",
      })

      router.push("/dashboard/videos")
    } catch (err: any) {
      console.error("Error creating video:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to create video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Video (Fallback)</CardTitle>
          <CardDescription>Generate a new AI video using HeyGen API</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select avatar" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleAvatars.map((avatar) => (
                      <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                        {avatar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="voice">Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleVoices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.name} ({voice.language}, {voice.gender})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="script">Script</Label>
                <Textarea
                  id="script"
                  placeholder="Enter your video script here..."
                  className="min-h-[200px]"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  maxLength={1500}
                />
                <div className="text-xs text-muted-foreground text-right">{script.length}/1500 characters</div>
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="speed">Voice Speed: {speed.toFixed(1)}x</Label>
                </div>
                <Slider
                  id="speed"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !script.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Video"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
