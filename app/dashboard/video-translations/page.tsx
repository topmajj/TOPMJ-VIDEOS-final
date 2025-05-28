"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Globe, Video, RefreshCw, Download, Play, Trash2, Upload, AlertTriangle, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { T } from "@/components/t"
import { getTranslation } from "@/lib/translations"
import { useLanguage } from "@/lib/language-context"
import { VideoPlayerWithSubtitles } from "@/components/video-player-with-subtitles"
import { SubtitleDebug } from "@/components/subtitle-debug"

interface Language {
  code: string
  name: string
}

interface HappyScribeTranslation {
  id: string
  transcription_id: string
  order_id: string
  export_id: string
  title: string
  status: string
  source_video_url: string
  target_language: string
  download_url: string | null
  format: string
  created_at: string
  updated_at: string
}

export default function VideoTranslationsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(key, language)

  const [apiAccessError, setApiAccessError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("create")
  const [videoUrl, setVideoUrl] = useState("")
  const [title, setTitle] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [translations, setTranslations] = useState<HappyScribeTranslation[]>([])
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dbError, setDbError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [selectedTranslation, setSelectedTranslation] = useState<HappyScribeTranslation | null>(null)
  const [isSavingSubtitle, setIsSavingSubtitle] = useState(false)

  // Fetch supported languages
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch("/api/happyscribe/languages")
        const data = await response.json()

        if (data.error) {
          console.error("Error fetching languages:", data.error)
          setApiAccessError(data.error)
          toast({
            title: "common.error",
            description: "videoTranslations.errors.failedToLoadLanguages",
            variant: "destructive",
          })
          return
        }

        if (data.data?.languages) {
          setLanguages(data.data.languages)
        }
      } catch (error) {
        console.error("Error fetching languages:", error)
        toast({
          title: "common.error",
          description: "videoTranslations.errors.failedToLoadLanguages",
          variant: "destructive",
        })
      }
    }

    fetchLanguages()
  }, [toast])

  // Fetch translations from happyscribe_translations table
  useEffect(() => {
    async function fetchTranslations() {
      setIsLoadingTranslations(true)
      try {
        const { data, error } = await supabase
          .from("happyscribe_translations")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching translations:", error)
          setDbError(error.message)
          return
        }

        setTranslations(data || [])

        // Check status of processing translations
        const processingTranslations = data?.filter((t) => t.status === "processing") || []
        for (const translation of processingTranslations) {
          checkTranslationStatus(translation.id)
        }
      } catch (error) {
        console.error("Error fetching translations:", error)
      } finally {
        setIsLoadingTranslations(false)
      }
    }

    fetchTranslations()

    // Set up polling for translations
    const interval = setInterval(() => {
      if (activeTab === "translations") {
        fetchTranslations()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [supabase, activeTab])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
      setUploadProgress(0)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "common.error",
        description: "videoTranslations.errors.selectFile",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)

      // Using Happy Scribe upload endpoint
      const response = await fetch("/api/happyscribe/upload", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "videoTranslations.errors.failedToUpload")
      }

      const data = await response.json()
      setUploadProgress(100)

      setVideoUrl(data.url)
      toast({
        title: "common.success",
        description: "videoTranslations.success.fileUploaded",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "common.error",
        description: error instanceof Error ? error.message : "videoTranslations.errors.failedToUpload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!videoUrl) {
      toast({
        title: "common.error",
        description: "videoTranslations.errors.provideVideoUrl",
        variant: "destructive",
      })
      return
    }

    if (!targetLanguage) {
      toast({
        title: "common.error",
        description: "videoTranslations.errors.selectTargetLanguage",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Using the new Happy Scribe API endpoint
      const response = await fetch("/api/happyscribe/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          output_language: targetLanguage,
          title: title || `${t("videoTranslations.defaultTitle")} ${targetLanguage} ${new Date().toLocaleDateString()}`,
        }),
      })

      const data = await response.json()

      if (response.status === 403) {
        toast({
          title: "videoTranslations.errors.accessDenied",
          description: "videoTranslations.errors.apiKeyNoAccess",
          variant: "destructive",
        })
        setApiAccessError("videoTranslations.errors.apiKeyNoAccess")
        return
      }

      if (data.error) {
        console.error("Error creating translation:", data.error)
        toast({
          title: "common.error",
          description: data.error || "videoTranslations.errors.failedToCreate",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "common.success",
        description: "videoTranslations.success.translationSubmitted",
      })

      // Reset form
      setVideoUrl("")
      setTitle("")
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Switch to translations tab
      setActiveTab("translations")

      // Refresh translations
      router.refresh()
    } catch (error) {
      console.error("Error creating translation:", error)
      toast({
        title: "common.error",
        description: "videoTranslations.errors.failedToCreate",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function checkTranslationStatus(id: string) {
    try {
      // Using the new Happy Scribe status endpoint
      const response = await fetch(`/api/happyscribe/exports/status/${id}`)
      const data = await response.json()

      if (data.error) {
        console.error(`Error checking translation status for ${id}:`, data.error)
        return
      }

      // Update the translation in the local state
      setTranslations((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: data.data?.status || t.status,
                download_url: data.data?.url || t.download_url,
                updated_at: new Date().toISOString(),
              }
            : t,
        ),
      )

      // If the translation is complete, show a toast
      if (data.data?.status === "success" && translations.find((t) => t.id === id)?.status !== "success") {
        toast({
          title: "videoTranslations.success.translationComplete",
          description: "videoTranslations.success.translationReady",
        })
      }
    } catch (error) {
      console.error(`Error checking translation status for ${id}:`, error)
    }
  }

  async function handleRefreshStatus(id: string) {
    toast({
      title: "videoTranslations.refreshing",
      description: "videoTranslations.checkingStatus",
    })
    await checkTranslationStatus(id)
  }

  async function handleDeleteTranslation(id: string) {
    try {
      const { error } = await supabase.from("happyscribe_translations").delete().eq("id", id)

      if (error) {
        console.error("Error deleting translation:", error)
        toast({
          title: "common.error",
          description: "videoTranslations.errors.failedToDelete",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "common.success",
        description: "videoTranslations.success.translationDeleted",
      })

      // Remove from local state
      setTranslations((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting translation:", error)
      toast({
        title: "common.error",
        description: "videoTranslations.errors.failedToDelete",
        variant: "destructive",
      })
    }
  }

  async function saveSubtitleContent(translation: HappyScribeTranslation, content: string) {
    setIsSavingSubtitle(true)
    try {
      const response = await fetch("/api/subtitles/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          translationId: translation.id,
          content: content,
          format: translation.format || "srt",
          language: translation.target_language,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save subtitle content")
      }

      toast({
        title: t("common.success"),
        description: t("videoTranslations.success.subtitleSaved"),
      })

      return true
    } catch (error) {
      console.error("Error saving subtitle content:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save subtitle content",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSavingSubtitle(false)
    }
  }

  async function fetchSubtitleContent(url: string) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch subtitle: ${response.status} ${response.statusText}`)
      }
      return await response.text()
    } catch (error) {
      console.error("Error fetching subtitle:", error)
      throw error
    }
  }

  async function handleSaveSubtitle(translation: HappyScribeTranslation) {
    if (!translation.download_url) {
      toast({
        title: "Error",
        description: "No subtitle URL available",
        variant: "destructive",
      })
      return
    }

    try {
      const content = await fetchSubtitleContent(translation.download_url)
      await saveSubtitleContent(translation, content)
    } catch (error) {
      console.error("Error saving subtitle:", error)
      toast({
        title: "Error",
        description: "Failed to save subtitle. The URL might be expired.",
        variant: "destructive",
      })
    }
  }

  function handlePreview(translation: HappyScribeTranslation) {
    setSelectedTranslation(translation)
    setPreviewUrl(translation.download_url)
    setPreviewTitle(translation.title)
    setPreviewOpen(true)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">{t("videoTranslations.status.completed")}</Badge>
      case "processing":
        return <Badge className="bg-yellow-500">{t("videoTranslations.status.processing")}</Badge>
      case "failed":
        return <Badge className="bg-red-500">{t("videoTranslations.status.failed")}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          <T text="videoTranslations.title" />
        </h1>
      </div>

      {dbError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("videoTranslations.errors.databaseError")}</AlertTitle>
          <AlertDescription>
            <p>{dbError}</p>
            <p className="mt-2">{t("videoTranslations.errors.runMigration")}</p>
            <p className="mt-2 text-sm">Run the migration: create_happyscribe_translations_table.sql</p>
          </AlertDescription>
        </Alert>
      )}

      {apiAccessError && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("videoTranslations.warnings.apiAccessWarning")}</AlertTitle>
          <AlertDescription>
            <p>{apiAccessError}</p>
            <p className="mt-2">{t("videoTranslations.warnings.happyScribeSubscription")}</p>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">{t("videoTranslations.tabs.create")}</TabsTrigger>
          <TabsTrigger value="translations">{t("videoTranslations.tabs.myTranslations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("videoTranslations.createNew")}</CardTitle>
              <CardDescription>{t("videoTranslations.createDescription")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>{t("videoTranslations.uploadVideo")}</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">{t("videoTranslations.dragAndDrop")}</p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {t("videoTranslations.selectVideo")}
                    </Button>

                    {uploadedFile && (
                      <div className="mt-4 w-full">
                        <p className="text-sm font-medium mb-1">{uploadedFile.name}</p>
                        <div className="w-full bg-muted rounded-full h-2 mb-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleFileUpload}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                {t("videoTranslations.uploading")}
                              </>
                            ) : (
                              <>{t("videoTranslations.upload")}</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-url">{t("videoTranslations.orEnterVideoUrl")}</Label>
                  <Input
                    id="video-url"
                    placeholder="https://example.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{t("videoTranslations.enterVideoUrlDescription")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">{t("videoTranslations.titleOptional")}</Label>
                  <Input
                    id="title"
                    placeholder={t("videoTranslations.titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t("videoTranslations.targetLanguage")}</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage} required>
                    <SelectTrigger id="language">
                      <SelectValue placeholder={t("videoTranslations.selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.length === 0 ? (
                        <SelectItem value="loading" disabled>
                          {t("videoTranslations.loadingLanguages")}
                        </SelectItem>
                      ) : (
                        languages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t("videoTranslations.happyScribeInfo.title")}</AlertTitle>
                    <AlertDescription>{t("videoTranslations.happyScribeInfo.description")}</AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading || (!videoUrl && !uploadedFile) || isUploading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("videoTranslations.creatingTranslation")}
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      {t("videoTranslations.createTranslation")}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <div className="grid gap-4">
            {isLoadingTranslations ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : translations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{t("videoTranslations.noTranslations")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("videoTranslations.createFirstTranslation")}</p>
                  <Button onClick={() => setActiveTab("create")}>{t("videoTranslations.createTranslation")}</Button>
                </CardContent>
              </Card>
            ) : (
              translations.map((translation) => (
                <Card key={translation.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{translation.title}</CardTitle>
                        <CardDescription>
                          {t("videoTranslations.createdOn")} {new Date(translation.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div>{getStatusBadge(translation.status)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-2">
                      <div className="flex items-center text-sm">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {t("videoTranslations.targetLanguage")}: {translation.target_language}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          {t("videoTranslations.source")}: {translation.source_video_url.substring(0, 50)}
                          {translation.source_video_url.length > 50 ? "..." : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      {translation.status === "success" && translation.download_url ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handlePreview(translation)}>
                            <Play className="mr-2 h-4 w-4" />
                            {t("videoTranslations.preview")}
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={translation.download_url}
                              download={`${translation.title}.srt`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {t("videoTranslations.download")}
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveSubtitle(translation)}
                            disabled={isSavingSubtitle}
                          >
                            {isSavingSubtitle ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            {t("videoTranslations.saveLocally")}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefreshStatus(translation.id)}
                          disabled={translation.status === "failed"}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {t("videoTranslations.refreshStatus")}
                        </Button>
                      )}
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteTranslation(translation.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("videoTranslations.delete")}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
            <DialogDescription>{t("videoTranslations.translatedVideoPreview")}</DialogDescription>
          </DialogHeader>
          {previewUrl && selectedTranslation && (
            <div className="aspect-video mt-2">
              <VideoPlayerWithSubtitles
                videoSrc={selectedTranslation.source_video_url}
                subtitlesSrc={previewUrl}
                translationId={selectedTranslation.id}
                className="w-full h-full rounded-md"
                showDebug={true}
              />
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button asChild>
              <a href={previewUrl!} download={`${previewTitle}.srt`} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                {t("videoTranslations.downloadSubtitles")}
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Debug Dialog */}
      <Dialog open={showDebug} onOpenChange={setShowDebug}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Subtitle Debug</DialogTitle>
            <DialogDescription>Analyzing subtitle file format and content</DialogDescription>
          </DialogHeader>
          {selectedTranslation && selectedTranslation.download_url && (
            <SubtitleDebug
              subtitleUrl={selectedTranslation.download_url}
              videoUrl={selectedTranslation.source_video_url}
              translationId={selectedTranslation.id}
            />
          )}
          <Button variant="outline" onClick={() => setShowDebug(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
