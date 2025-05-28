"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Loader2, Volume2, VolumeX, Maximize, Play, Pause } from "lucide-react"
import { T } from "@/components/t"

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  supabaseUrl?: string
  autoPlay?: boolean
}

export function VideoPlayer({ src, poster, className = "", supabaseUrl, autoPlay = false }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Prioritize Supabase URL if available
  const videoSrc = supabaseUrl || src

  useEffect(() => {
    if (videoSrc) {
      setIsLoading(true)
      setError(null)

      const video = document.createElement("video")
      video.src = videoSrc

      video.onloadeddata = () => {
        setIsLoading(false)
      }

      video.onerror = () => {
        setIsLoading(false)
        setError("Failed to load video")
      }

      return () => {
        video.onloadeddata = null
        video.onerror = null
      }
    }
  }, [videoSrc])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(videoElement.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("durationchange", handleDurationChange)
    videoElement.addEventListener("ended", handleEnded)

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("durationchange", handleDurationChange)
      videoElement.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isPlaying) {
      videoElement.play().catch((error) => {
        console.error("Error playing video:", error)
        setIsPlaying(false)
      })
    } else {
      videoElement.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    videoElement.muted = isMuted
  }, [isMuted])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const showControls = () => {
    setIsControlsVisible(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false)
      }
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (!videoSrc) {
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <p className="text-white">
          <T text="videos.player.noSource" />
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <p className="text-white">{error}</p>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden bg-black ${className}`}
      onMouseMove={showControls}
      onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        className="w-full h-full"
        preload="metadata"
        onClick={handlePlayPause}
        playsInline
      />

      {/* Custom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${
          isControlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2">
          {/* Progress bar */}
          <div className="flex items-center gap-2 text-white text-xs">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-white/80 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMuteToggle}
                className="text-white hover:text-white/80 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

              <button
                onClick={handleFullscreen}
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Fullscreen"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
