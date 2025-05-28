"use client"

import { useState, useRef } from "react"
import { Play, Pause, Search, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

interface VoiceSelectorProps {
  voices: Voice[]
  selectedId: string
  onSelect: (id: string) => void
}

export function VoiceSelector({ voices, selectedId, onSelect }: VoiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Filter voices based on search query
  const filteredVoices = voices.filter(
    (voice) =>
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.gender.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePlay = (voice: Voice) => {
    const audioUrl = voice.preview_audio || voice.sample_url

    if (!audioUrl) return

    if (playingId === voice.voice_id) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setPlayingId(null)
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause()
      }

      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      audioRef.current.onended = () => setPlayingId(null)
      setPlayingId(voice.voice_id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search voices..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {filteredVoices.length > 0 ? (
            filteredVoices.map((voice) => (
              <VoiceCard
                key={voice.voice_id}
                voice={voice}
                isSelected={selectedId === voice.voice_id}
                isPlaying={playingId === voice.voice_id}
                onSelect={onSelect}
                onPlay={() => handlePlay(voice)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No voices found matching "{searchQuery}"</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface VoiceCardProps {
  voice: Voice
  isSelected: boolean
  isPlaying: boolean
  onSelect: (id: string) => void
  onPlay: () => void
}

function VoiceCard({ voice, isSelected, isPlaying, onSelect, onPlay }: VoiceCardProps) {
  const hasAudio = !!(voice.preview_audio || voice.sample_url)

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50",
      )}
      onClick={() => onSelect(voice.voice_id)}
    >
      <div className="flex items-center gap-3">
        {isSelected && (
          <div className="bg-primary text-primary-foreground rounded-full p-0.5">
            <Check className="h-3 w-3" />
          </div>
        )}
        <div>
          <p className="font-medium">{voice.name}</p>
          <p className="text-xs text-muted-foreground">
            {voice.language}, {voice.gender}
            {voice.emotion_support && " • Emotion Support"}
          </p>
        </div>
      </div>

      {hasAudio && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onPlay()
          }}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}
