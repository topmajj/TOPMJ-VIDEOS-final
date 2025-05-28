"use client"

import { useState } from "react"
import { Check, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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

interface AvatarGridSelectorProps {
  avatars: Avatar[]
  talkingPhotos: TalkingPhoto[]
  selectedId: string
  onSelect: (id: string) => void
}

export function AvatarGridSelector({ avatars, talkingPhotos, selectedId, onSelect }: AvatarGridSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"avatars" | "photos">("avatars")

  // Filter avatars based on search query
  const filteredAvatars = avatars.filter((avatar) =>
    avatar.avatar_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter talking photos based on search query
  const filteredTalkingPhotos = talkingPhotos.filter((photo) =>
    photo.talking_photo_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search avatars..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex border-b">
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium",
            activeTab === "avatars" ? "border-b-2 border-primary" : "text-muted-foreground",
          )}
          onClick={() => setActiveTab("avatars")}
        >
          Avatars ({avatars.length})
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium",
            activeTab === "photos" ? "border-b-2 border-primary" : "text-muted-foreground",
          )}
          onClick={() => setActiveTab("photos")}
        >
          Talking Photos ({talkingPhotos.length})
        </button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {activeTab === "avatars" ? (
            filteredAvatars.length > 0 ? (
              filteredAvatars.map((avatar) => (
                <AvatarCard
                  key={avatar.avatar_id}
                  id={avatar.avatar_id}
                  name={avatar.avatar_name}
                  imageUrl={avatar.preview_image_url}
                  gender={avatar.gender}
                  premium={avatar.premium}
                  isSelected={selectedId === avatar.avatar_id}
                  onSelect={onSelect}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No avatars found matching "{searchQuery}"
              </div>
            )
          ) : filteredTalkingPhotos.length > 0 ? (
            filteredTalkingPhotos.map((photo) => (
              <AvatarCard
                key={photo.talking_photo_id}
                id={photo.talking_photo_id}
                name={photo.talking_photo_name}
                imageUrl={photo.preview_image_url}
                isSelected={selectedId === photo.talking_photo_id}
                onSelect={onSelect}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No talking photos found matching "{searchQuery}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface AvatarCardProps {
  id: string
  name: string
  imageUrl: string
  gender?: string
  premium?: boolean
  isSelected: boolean
  onSelect: (id: string) => void
}

function AvatarCard({ id, name, imageUrl, gender, premium, isSelected, onSelect }: AvatarCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border cursor-pointer transition-all",
        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50",
      )}
      onClick={() => onSelect(id)}
    >
      <div className="aspect-square bg-muted">
        <img
          src={imageUrl || "/placeholder.svg?height=100&width=100"}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=100&width=100"
          }}
        />
      </div>
      <div className="p-2 bg-card">
        <p className="text-xs font-medium truncate">{name}</p>
        {gender && <p className="text-xs text-muted-foreground capitalize">{gender}</p>}
      </div>
      {premium && (
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-sm font-medium">
          PRO
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-0.5">
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  )
}
