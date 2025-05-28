"use client"

import { Mic, MoreHorizontal, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data
const voices = [
  {
    id: "1",
    name: "Professional Voice",
    language: "English (US)",
    duration: "30 seconds",
    status: "Ready",
  },
  {
    id: "2",
    name: "Casual Voice",
    language: "English (UK)",
    duration: "45 seconds",
    status: "Ready",
  },
  {
    id: "3",
    name: "Presentation Voice",
    language: "Spanish",
    duration: "60 seconds",
    status: "Processing",
  },
]

export default function VoiceCloningPage() {
  return (
    <div className="flex-1 w-full">
      <div className="w-full">
        <h1 className="text-3xl font-bold tracking-tight">Voice Cloning</h1>
        <p className="text-muted-foreground">Create and manage your AI voice clones</p>
      </div>

      <Tabs defaultValue="my-voices" className="w-full mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="my-voices">My Voices</TabsTrigger>
          <TabsTrigger value="create-voice">Create Voice</TabsTrigger>
          <TabsTrigger value="voice-library">Voice Library</TabsTrigger>
        </TabsList>

        <TabsContent value="my-voices" className="w-full space-y-4 mt-4">
          {voices.map((voice) => (
            <div key={voice.id} className="flex items-center gap-4 rounded-lg border p-4 w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mic className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{voice.name}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{voice.language}</span>
                  <span>•</span>
                  <span>{voice.duration}</span>
                  <span>•</span>
                  <span className="capitalize">{voice.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={voice.status === "Processing"}>
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Play</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="create-voice" className="w-full">
          {/* Create voice content */}
        </TabsContent>

        <TabsContent value="voice-library" className="w-full">
          {/* Voice library content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
