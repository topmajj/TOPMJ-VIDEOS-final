"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Loader2, Volume2, VolumeX, Maximize, Play, Pause, Subtitles, AlertTriangle } from "lucide-react"
import { fetchAndParseSubtitles, type SubtitleCue } from "@/lib/srt-parser"
import { cn } from "@/lib/utils"

interface VideoPlayerWithSubtitlesProps {
  videoSrc: string
  subtitlesSrc?: string
  translationId?: string
  className?: string
  autoPlay?: boolean
  showDebug?: boolean
}

export function VideoPlayerWithSubtitles({
  videoSrc,
  subtitlesSrc,
  translationId,
  className = "",
  autoPlay = false,
  showDebug = false,
}: VideoPlayerWithSubtitlesProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([])
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("")
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [subtitlesLoading, setSubtitlesLoading] = useState(false)
  const [subtitlesError, setSubtitlesError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [localSubtitleUrl, setLocalSubtitleUrl] = useState<string | null>(null)
  const [usingLocalSubtitles, setUsingLocalSubtitles] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timeUpdateRef = useRef<boolean>(false)

  // Handle subtitle loading
  useEffect(() => {
    if (subtitlesSrc || translationId) {
      const loadSubtitles = async () => {
        setSubtitlesLoading(true)
        setSubtitlesError(null)
        setDebugInfo("")

        try {
          // First try to load from local API if we have a translation ID
          if (translationId) {
            const localUrl = `/api/subtitles/translation/${translationId}`
            setDebugInfo((prev) => prev + `Trying local subtitles from: ${localUrl}\n`)

            try {
              const localResponse = await fetch(localUrl)
              if (localResponse.ok) {
                const content = await localResponse.text()
                const parsedSubtitles = await fetchAndParseSubtitles(content)

                if (parsedSubtitles.length > 0) {
                  setSubtitles(parsedSubtitles)
                  setLocalSubtitleUrl(localUrl)
                  setUsingLocalSubtitles(true)
                  setDebugInfo(
                    (prev) => prev + `Successfully loaded ${parsedSubtitles.length} subtitles from local storage\n`,
                  )
                  setSubtitlesLoading(false)
                  return
                } else {
                  setDebugInfo((prev) => prev + "Local subtitles found but no cues parsed\n")
                }
              } else {
                setDebugInfo((prev) => prev + `Local subtitles not found (${localResponse.status})\n`)
              }
            } catch (err) {
              setDebugInfo((prev) => prev + `Error loading local subtitles: ${err}\n`)
            }
          }

          // If we don't have local subtitles or they failed to load, try remote URL
          if (subtitlesSrc) {
            setDebugInfo((prev) => prev + `Loading remote subtitles from: ${subtitlesSrc}\n`)

            try {
              const response = await fetch(subtitlesSrc)

              if (!response.ok) {
                throw new Error(`Failed to fetch subtitles: ${response.status}`)
              }

              const content = await response.text()

              // Determine format from URL or content
              let format = "srt"
              if (subtitlesSrc.endsWith(".vtt")) format = "vtt"
              else if (subtitlesSrc.endsWith(".json")) format = "json"

              // Parse subtitles
              const parsedSubtitles = await fetchAndParseSubtitles(content)
              setSubtitles(parsedSubtitles)
              setDebugInfo((prev) => prev + `Parsed ${parsedSubtitles.length} subtitle cues from remote source\n`)

              if (parsedSubtitles.length === 0) {
                setSubtitlesError("No subtitles found in the file")
                setDebugInfo((prev) => prev + "Error: No subtitles found in the file\n")
              }

              // Store subtitle content locally if we have a translation ID
              if (translationId && parsedSubtitles.length > 0) {
                try {
                  const storeResponse = await fetch("/api/subtitles/store", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      translationId,
                      content,
                      format,
                      language: "unknown", // This will be overridden by the server if it knows the language
                    }),
                  })

                  if (storeResponse.ok) {
                    setDebugInfo((prev) => prev + "Successfully stored subtitles locally\n")
                    setLocalSubtitleUrl(`/api/subtitles/translation/${translationId}`)
                  } else {
                    setDebugInfo((prev) => prev + `Failed to store subtitles locally: ${storeResponse.status}\n`)
                  }
                } catch (storeErr) {
                  setDebugInfo((prev) => prev + `Error storing subtitles: ${storeErr}\n`)
                }
              }
            } catch (err) {
              console.error("Error loading remote subtitles:", err)
              setSubtitlesError("Failed to load subtitles: " + (err instanceof Error ? err.message : String(err)))
              setDebugInfo((prev) => prev + `Error: ${err instanceof Error ? err.message : String(err)}\n`)

              // If remote loading failed and we have a translation ID, try local again as a fallback
              if (translationId && !usingLocalSubtitles) {
                setDebugInfo((prev) => prev + "Remote loading failed, trying local fallback...\n")

                try {
                  const localUrl = `/api/subtitles/translation/${translationId}`
                  const localResponse = await fetch(localUrl)

                  if (localResponse.ok) {
                    const content = await localResponse.text()
                    const parsedSubtitles = await fetchAndParseSubtitles(content)

                    if (parsedSubtitles.length > 0) {
                      setSubtitles(parsedSubtitles)
                      setLocalSubtitleUrl(localUrl)
                      setUsingLocalSubtitles(true)
                      setSubtitlesError(null)
                      setDebugInfo(
                        (prev) =>
                          prev + `Successfully loaded ${parsedSubtitles.length} subtitles from local fallback\n`,
                      )
                    } else {
                      setDebugInfo((prev) => prev + "Local fallback found but no cues parsed\n")
                    }
                  } else {
                    setDebugInfo((prev) => prev + `Local fallback not found (${localResponse.status})\n`)
                  }
                } catch (fallbackErr) {
                  setDebugInfo((prev) => prev + `Error loading local fallback: ${fallbackErr}\n`)
                }
              }
            }
          }
        } catch (err) {
          console.error("Error in subtitle processing:", err)
          setSubtitlesError("Error processing subtitles")
          setDebugInfo((prev) => prev + `Error in subtitle processing: ${String(err)}\n`)
        } finally {
          setSubtitlesLoading(false)
        }
      }

      loadSubtitles()
    }
  }, [subtitlesSrc, translationId])

  // Update current subtitle based on video time
  useEffect(() => {
    if (!showSubtitles || subtitles.length === 0) {
      setCurrentSubtitle("")
      return
    }

    const activeCue = subtitles.find((cue) => currentTime >= cue.startTime && currentTime <= cue.endTime)

    setCurrentSubtitle(activeCue ? activeCue.text : "")
  }, [currentTime, subtitles, showSubtitles])

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
      timeUpdateRef.current = true
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

    // Check if timeupdate events are firing
    const timeUpdateCheck = setInterval(() => {
      if (isPlaying && !timeUpdateRef.current) {
        console.warn("Video is playing but timeupdate events are not firing")
        // Force a time update
        setCurrentTime(videoElement.currentTime)
      }
      timeUpdateRef.current = false
    }, 1000)

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("durationchange", handleDurationChange)
      videoElement.removeEventListener("ended", handleEnded)
      clearInterval(timeUpdateCheck)
    }
  }, [isPlaying])

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

  const handleSubtitlesToggle = () => {
    setShowSubtitles(!showSubtitles)
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
      <div className={cn("flex items-center justify-center bg-black", className)}>
        <p className="text-white">No video source provided</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-black", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-black", className)}>
        <p className="text-white">{error}</p>
      </div>
    )
  }

  return (
    <div
      className={cn("relative overflow-hidden bg-black", className)}
      onMouseMove={showControls}
      onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full"
        preload="metadata"
        onClick={handlePlayPause}
        playsInline
      />

      {/* Subtitles overlay */}
      {showSubtitles && currentSubtitle && (
        <div className="absolute bottom-20 left-0 right-0 text-center px-4">
          <div className="inline-block bg-black/80 text-white px-4 py-2 rounded">
            <p className="text-lg whitespace-pre-wrap">{currentSubtitle}</p>
          </div>
        </div>
      )}

      {/* Subtitles error message */}
      {subtitlesError && (
        <div className="absolute top-4 left-0 right-0 text-center">
          <div className="inline-block bg-red-500/80 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {subtitlesError}
          </div>
        </div>
      )}

      {/* Custom controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "opacity-0",
        )}
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

              {(subtitlesSrc || translationId) && (
                <button
                  onClick={handleSubtitlesToggle}
                  className={cn(
                    "transition-colors",
                    showSubtitles ? "text-white" : "text-white/50 hover:text-white/80",
                  )}
                  aria-label={showSubtitles ? "Hide subtitles" : "Show subtitles"}
                >
                  <Subtitles className="h-5 w-5" />
                </button>
              )}

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

      {/* Loading indicator for subtitles */}
      {subtitlesLoading && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/60 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading subtitles...
          </div>
        </div>
      )}
    </div>
  )
}
