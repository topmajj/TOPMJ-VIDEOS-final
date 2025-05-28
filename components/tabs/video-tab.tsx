"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { VideoList } from "@/components/video-list"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { T } from "@/components/t"

// Define types for our data
interface Avatar {
  avatar_id: string
  avatar_name: string
  gender: string
  preview_image_url: string
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
}

export function VideoTab() {
  const [loading, setLoading] = useState(false)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [talkingPhotos, setTalkingPhotos] = useState<TalkingPhoto[]>([])
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [script, setScript] = useState("")
  const [fetchingAvatars, setFetchingAvatars] = useState(true)
  const [fetchingVoices, setFetchingVoices] = useState(true)
  const [avatarsError, setAvatarsError] = useState<string | null>(null)
  const [voicesError, setVoicesError] = useState<string | null>(null)
  const [usingSampleData, setUsingSampleData] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Function to fetch avatars
  const fetchAvatars = async () => {
    try {
      setFetchingAvatars(true)
      setAvatarsError(null)

      console.log("Fetching avatars...")

      const response = await fetch("/api/heygen/avatars")

      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Extract avatars and talking photos from the response
      const avatarsArray = data.avatars || []
      const talkingPhotosArray = data.talking_photos || []

      if (avatarsArray.length === 0 && talkingPhotosArray.length === 0) {
        throw new Error("No avatars or talking photos found")
      }

      setAvatars(avatarsArray)
      setTalkingPhotos(talkingPhotosArray)

      // Check if we're using sample data
      if (data.usingSampleData) {
        setUsingSampleData(true)
      }

      // Set default selected avatar if we have one
      if (avatarsArray.length > 0 && !selectedAvatar) {
        setSelectedAvatar(avatarsArray[0].avatar_id)
      } else if (talkingPhotosArray.length > 0 && !selectedAvatar) {
        setSelectedAvatar(talkingPhotosArray[0].talking_photo_id)
      }

      console.log(`Loaded ${avatarsArray.length} avatars and ${talkingPhotosArray.length} talking photos`)
    } catch (err: any) {
      console.error("Error fetching avatars:", err)
      setAvatarsError(err.message || "Failed to load avatars")
    } finally {
      setFetchingAvatars(false)
    }
  }

  // Function to fetch voices
  const fetchVoices = async () => {
    try {
      setFetchingVoices(true)
      setVoicesError(null)

      console.log("Fetching voices...")

      const response = await fetch("/api/heygen/voices")

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Extract voices from the response
      const voicesArray = data.voices || []

      if (voicesArray.length === 0) {
        throw new Error("No voices found")
      }

      setVoices(voicesArray)

      // Check if we're using sample data
      if (data.usingSampleData) {
        setUsingSampleData(true)
      }

      // Set default selected voice if we have one
      if (voicesArray.length > 0 && !selectedVoice) {
        setSelectedVoice(voicesArray[0].voice_id)
      }

      console.log(`Loaded ${voicesArray.length} voices`)
    } catch (err: any) {
      console.error("Error fetching voices:", err)
      setVoicesError(err.message || "Failed to load voices")
    } finally {
      setFetchingVoices(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchAvatars()
    fetchVoices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAvatar) {
      toast({
        title: "Error",
        description: "Please select an avatar",
        variant: "destructive",
      })
      return
    }

    if (!selectedVoice) {
      toast({
        title: "Error",
        description: "Please select a voice",
        variant: "destructive",
      })
      return
    }

    if (!script.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/heygen/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar_id: selectedAvatar,
          voice_id: selectedVoice,
          script,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create video")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Video creation started successfully!",
      })

      // Redirect to videos page to see the new video
      router.push("/dashboard/videos")
    } catch (err: any) {
      console.error("Error creating video:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to create video",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Manual retry function
  const handleRetry = () => {
    fetchAvatars()
    fetchVoices()
  }

  const isLoading = fetchingAvatars || fetchingVoices
  const hasError = avatarsError || voicesError

  return (
    // <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    //   <Card className="col-span-1">
    //     <CardHeader>
    //       <CardTitle>Create New Video</CardTitle>
    //       <CardDescription>Generate a new AI video using HeyGen API</CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       {usingSampleData && !hasError && (
    //         <Alert variant="warning" className="mb-4">
    //           <Info className="h-4 w-4" />
    //           <AlertTitle>Using sample data</AlertTitle>
    //           <AlertDescription>
    //             We're using sample data because the HeyGen API is not responding properly.
    //             <Button variant="outline" size="sm" className="w-fit mt-2" onClick={handleRetry}>
    //               <RefreshCw className="h-4 w-4 mr-2" />
    //               Try Again
    //             </Button>
    //           </AlertDescription>
    //         </Alert>
    //       )}

    //       {avatarsError && (
    //         <Alert variant="destructive" className="mb-4">
    //           <AlertTriangle className="h-4 w-4" />
    //           <AlertTitle>Error loading avatars</AlertTitle>
    //           <AlertDescription className="flex flex-col gap-2">
    //             <p>{avatarsError}</p>
    //             <Button variant="outline" size="sm" className="w-fit" onClick={handleRetry}>
    //               <RefreshCw className="h-4 w-4 mr-2" />
    //               Try Again
    //             </Button>
    //           </AlertDescription>
    //         </Alert>
    //       )}

    //       {voicesError && (
    //         <Alert variant="destructive" className="mb-4">
    //           <AlertTriangle className="h-4 w-4" />
    //           <AlertTitle>Error loading voices</AlertTitle>
    //           <AlertDescription className="flex flex-col gap-2">
    //             <p>{voicesError}</p>
    //             <Button variant="outline" size="sm" className="w-fit" onClick={handleRetry}>
    //               <RefreshCw className="h-4 w-4 mr-2" />
    //               Try Again
    //             </Button>
    //           </AlertDescription>
    //         </Alert>
    //       )}

    //       {isLoading ? (
    //         <div className="flex flex-col items-center justify-center py-8">
    //           <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
    //           <p className="text-sm text-muted-foreground">
    //             {fetchingAvatars && fetchingVoices
    //               ? "Loading avatars and voices..."
    //               : fetchingAvatars
    //                 ? "Loading avatars..."
    //                 : "Loading voices..."}
    //           </p>
    //         </div>
    //       ) : (
    //         <form onSubmit={handleSubmit}>
    //           <div className="grid gap-4">
    //             <div className="grid gap-2">
    //               <Label htmlFor="avatar">Avatar</Label>
    //               <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Select avatar" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="" disabled>
    //                     Select an avatar
    //                   </SelectItem>
    //                   {avatars.length > 0 && (
    //                     <>
    //                       <SelectItem value="" disabled className="font-semibold">
    //                         Avatars
    //                       </SelectItem>
    //                       {avatars.map((avatar) => (
    //                         <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
    //                           {avatar.avatar_name} ({avatar.gender})
    //                         </SelectItem>
    //                       ))}
    //                     </>
    //                   )}
    //                   {talkingPhotos.length > 0 && (
    //                     <>
    //                       <SelectItem value="" disabled className="font-semibold">
    //                         Talking Photos
    //                       </SelectItem>
    //                       {talkingPhotos.map((photo) => (
    //                         <SelectItem key={photo.talking_photo_id} value={photo.talking_photo_id}>
    //                           {photo.talking_photo_name}
    //                         </SelectItem>
    //                       ))}
    //                     </>
    //                   )}
    //                 </SelectContent>
    //               </Select>
    //             </div>
    //             <div className="grid gap-2">
    //               <Label htmlFor="voice">Voice</Label>
    //               <Select value={selectedVoice} onValueChange={setSelectedVoice}>
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Select voice" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   {voices.map((voice) => (
    //                     <SelectItem key={voice.voice_id} value={voice.voice_id}>
    //                       {voice.name} ({voice.language}, {voice.gender})
    //                     </SelectItem>
    //                   ))}
    //                 </SelectContent>
    //               </Select>
    //             </div>
    //             <div className="grid gap-2">
    //               <Label htmlFor="script">Script</Label>
    //               <Textarea
    //                 id="script"
    //                 placeholder="Enter your video script here..."
    //                 className="min-h-[100px]"
    //                 value={script}
    //                 onChange={(e) => setScript(e.target.value)}
    //               />
    //             </div>
    //           </div>
    //         </form>
    //       )}
    //     </CardContent>
    //     <CardFooter>
    //       <Button
    //         className="w-full"
    //         onClick={handleSubmit}
    //         disabled={loading || isLoading || !selectedAvatar || !selectedVoice || !script.trim()}
    //       >
    //         {loading ? (
    //           <>
    //             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //             Creating...
    //           </>
    //         ) : (
    //           "Create Video"
    //         )}
    //       </Button>
    //     </CardFooter>
    //   </Card>
    //   <Card className="col-span-1 md:col-span-2">
    //     <CardHeader>
    //       <CardTitle>Your Videos</CardTitle>
    //       <CardDescription>Manage your generated videos</CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       <VideoList />
    //     </CardContent>
    //   </Card>
    // </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          <T text="videos.tabs.all" />
        </h2>
        <Button onClick={() => router.push("/dashboard/videos/create")}>
          <Plus className="mr-2 h-4 w-4" />
          <T text="videos.create" />
        </Button>
      </div>
      <VideoList />
    </div>
  )
}
