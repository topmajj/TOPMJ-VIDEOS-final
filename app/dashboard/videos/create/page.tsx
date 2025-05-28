"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle, RefreshCw, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AvatarGridSelector } from "@/components/avatar-grid-selector"
import { VoiceSelector } from "@/components/voice-selector"
import { Translation as T } from "@/components/translation"

// Define types based on the actual API response structure
interface Avatar {
  avatar_id: string
  avatar_name: string
  gender: string
  preview_image_url: string
  preview_video_url?: string
  premium?: boolean
  type?: string | null
  tags?: string[] | null
}

interface TalkingPhoto {
  talking_photo_id: string
  talking_photo_name: string
  preview_image_url: string
}

interface Voice {
  voice_id: string
  name: string
  language: string
  gender: string
  preview_audio?: string
  sample_url?: string
  support_pause?: boolean
  emotion_support?: boolean
  support_interactive_avatar?: boolean
}

export default function CreateVideoPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [talkingPhotos, setTalkingPhotos] = useState<TalkingPhoto[]>([])
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [script, setScript] = useState("")
  const [speed, setSpeed] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"avatar" | "voice" | "script">("avatar")

  const fetchData = async () => {
    try {
      setFetchingData(true)
      setError("")

      console.log("Fetching avatars and voices...")

      // Fetch avatars
      const avatarsResponse = await fetch("/api/heygen/avatars")
      const avatarsData = await avatarsResponse.json()

      // Fetch voices
      const voicesResponse = await fetch("/api/heygen/voices")
      const voicesData = await voicesResponse.json()

      // Set avatars and talking photos from the response
      const avatarsArray = Array.isArray(avatarsData.avatars)
        ? avatarsData.avatars.filter((avatar) => avatar && avatar.avatar_id && avatar.avatar_name)
        : []

      const talkingPhotosArray = Array.isArray(avatarsData.talking_photos)
        ? avatarsData.talking_photos.filter((photo) => photo && photo.talking_photo_id && photo.talking_photo_name)
        : []

      const voicesArray = Array.isArray(voicesData.voices)
        ? voicesData.voices.filter((voice) => voice && voice.voice_id && voice.name)
        : []

      if (avatarsArray.length === 0 && talkingPhotosArray.length === 0 && voicesArray.length === 0) {
        throw new Error("No valid avatars, talking photos, or voices found")
      }

      setAvatars(avatarsArray)
      setTalkingPhotos(talkingPhotosArray)
      setVoices(voicesArray)

      console.log(
        `Loaded ${avatarsArray.length} avatars and ${talkingPhotosArray.length} talking photos and ${voicesArray.length} voices`,
      )

      // Set default selections if available
      if (avatarsArray.length > 0 && !selectedAvatar) {
        setSelectedAvatar(avatarsArray[0].avatar_id)
      } else if (talkingPhotosArray.length > 0 && !selectedAvatar) {
        setSelectedAvatar(talkingPhotosArray[0].talking_photo_id)
      }

      if (voicesArray.length > 0 && !selectedVoice) {
        setSelectedVoice(voicesArray[0].voice_id)
      }
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setError(err.message || "Failed to load avatars and voices")
    } finally {
      setFetchingData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAvatar) {
      toast({
        title: <T text="common.error" />,
        description: <T text="videos.create.errors.selectAvatar" />,
        variant: "destructive",
      })
      return
    }

    if (!selectedVoice) {
      toast({
        title: <T text="common.error" />,
        description: <T text="videos.create.errors.selectVoice" />,
        variant: "destructive",
      })
      return
    }

    if (!script.trim()) {
      toast({
        title: <T text="common.error" />,
        description: <T text="videos.create.errors.enterScript" />,
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/heygen/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar_id: selectedAvatar,
          voice_id: selectedVoice,
          script,
          speed,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create video")
      }

      toast({
        title: <T text="common.success" />,
        description: <T text="videos.create.videoCreationStarted" />,
      })

      // Redirect to the videos page
      router.push("/dashboard/videos")
    } catch (err: any) {
      console.error("Error creating video:", err)
      toast({
        title: <T text="common.error" />,
        description: err.message || <T text="videos.create.errors.failedToCreate" />,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get selected avatar details
  const selectedAvatarDetails =
    avatars.find((a) => a.avatar_id === selectedAvatar) ||
    talkingPhotos.find((p) => p.talking_photo_id === selectedAvatar)

  // Get selected voice details
  const selectedVoiceDetails = voices.find((v) => v.voice_id === selectedVoice)

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium">
          <T text="videos.create.loadingAvatarsVoices" />
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          <T text="videos.create.mayTakeMoment" />
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            <T text="videos.create.errorLoadingData" />
          </AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={() => fetchData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              <T text="videos.create.tryAgain" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              <T text="videos.create.title" />
            </h1>
            <p className="text-muted-foreground">
              <T text="videos.create.description" />
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading || !selectedAvatar || !selectedVoice || !script.trim()}
            className="md:w-auto w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <T text="videos.create.creatingVideo" />
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                <T text="videos.create.generateVideo" />
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="avatar"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <T text="videos.create.tabs.chooseAvatar" />
                </TabsTrigger>
                <TabsTrigger
                  value="voice"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <T text="videos.create.tabs.selectVoice" />
                </TabsTrigger>
                <TabsTrigger
                  value="script"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <T text="videos.create.tabs.writeScript" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="avatar" className="space-y-4 mt-2">
                <AvatarGridSelector
                  avatars={avatars}
                  talkingPhotos={talkingPhotos}
                  selectedId={selectedAvatar}
                  onSelect={setSelectedAvatar}
                />

                <div className="flex justify-between mt-4">
                  <div></div>
                  <Button onClick={() => setActiveTab("voice")}>
                    <T text="videos.create.nextSelectVoice" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="voice" className="space-y-4 mt-2">
                <VoiceSelector voices={voices} selectedId={selectedVoice} onSelect={setSelectedVoice} />

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setActiveTab("avatar")}>
                    <T text="videos.create.backChooseAvatar" />
                  </Button>
                  <Button onClick={() => setActiveTab("script")}>
                    <T text="videos.create.nextWriteScript" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="script" className="space-y-4 mt-2">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="script">
                        <T text="videos.create.script" />
                      </Label>
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
                        <Label htmlFor="speed">
                          <T text="videos.create.voiceSpeed" />: {speed.toFixed(1)}x
                        </Label>
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

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      <T text="videos.create.selectedAvatarVoice" />
                    </h3>
                    <div className="rounded-lg border overflow-hidden">
                      {selectedAvatarDetails && (
                        <div className="aspect-square bg-muted">
                          <img
                            src={selectedAvatarDetails.preview_image_url || "/placeholder.svg?height=100&width=100"}
                            alt={selectedAvatarDetails.avatar_name || selectedAvatarDetails.talking_photo_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3 space-y-2">
                        <p className="font-medium">
                          {selectedAvatarDetails?.avatar_name ||
                            selectedAvatarDetails?.talking_photo_name ||
                            "No avatar selected"}
                        </p>
                        {selectedVoiceDetails && (
                          <p className="text-sm text-muted-foreground">
                            Voice: {selectedVoiceDetails.name} ({selectedVoiceDetails.language},{" "}
                            {selectedVoiceDetails.gender})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setActiveTab("voice")}>
                    <T text="videos.create.backSelectVoice" />
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !selectedAvatar || !selectedVoice || !script.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <T text="videos.create.creating" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <T text="videos.create.generateVideo" />
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
