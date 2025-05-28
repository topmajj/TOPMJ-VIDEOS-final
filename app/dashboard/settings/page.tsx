"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, Lock, Moon, Sun } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { LanguageSettings } from "@/components/language-settings"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

type ProfileData = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  company: string | null
  created_at: string
  updated_at: string
}

type Preferences = {
  theme: string
  language: string
  timezone: string
  sidebar_collapsed: boolean
  compact_view: boolean
  default_page: string
  email_notifications: {
    processing_complete: boolean
    new_features: boolean
    tips: boolean
  }
  app_notifications: {
    processing_complete: boolean
    new_features: boolean
    tips: boolean
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { language } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const t = (key: string) => getTranslation(key, language)

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        const data = await response.json()

        if (data.error) {
          toast({
            title: t("common.error"),
            description: data.error,
            variant: "destructive",
          })
          return
        }

        setProfile(data.profile)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: t("common.error"),
          description: t("settings.failedToFetchProfile"),
          variant: "destructive",
        })
      }
    }

    // Fetch preferences
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/profile/preferences")
        const data = await response.json()

        if (data.error) {
          // Don't show error toast for preferences, just log it
          console.error("Error fetching preferences:", data.error)
          return
        }

        setPreferences(data.preferences)
      } catch (error) {
        console.error("Error fetching preferences:", error)
      }
    }

    fetchProfile()
    fetchPreferences()
  }, [toast]) // Removed t from dependencies

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          company: profile?.company,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast({
          title: t("common.error"),
          description: data.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: t("common.success"),
        description: t("settings.profileUpdated"),
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: t("common.error"),
        description: t("settings.failedToUpdateProfile"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError(t("settings.passwordsDoNotMatch"))
      return
    }

    if (newPassword.length < 6) {
      setPasswordError(t("settings.passwordTooShort"))
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast({
          title: t("common.error"),
          description: data.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: t("common.success"),
        description: t("settings.passwordUpdated"),
      })

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: t("common.error"),
        description: t("settings.failedToUpdatePassword"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSubmit = async (updatedPreferences: Partial<Preferences>) => {
    setLoading(true)

    try {
      const response = await fetch("/api/profile/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...preferences,
          ...updatedPreferences,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast({
          title: t("common.error"),
          description: data.error,
          variant: "destructive",
        })
        return
      }

      setPreferences(data.preferences)

      toast({
        title: t("common.success"),
        description: t("settings.preferencesUpdated"),
      })

      // Apply theme if it was changed
      if (updatedPreferences.theme) {
        document.documentElement.classList.remove("light", "dark")
        if (updatedPreferences.theme !== "system") {
          document.documentElement.classList.add(updatedPreferences.theme)
        }
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: t("common.error"),
        description: t("settings.failedToUpdatePreferences"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (theme: string) => {
    handlePreferencesSubmit({ theme })
  }

  const handleLanguageChange = (language: string) => {
    handlePreferencesSubmit({ language })
  }

  const handleTimezoneChange = (timezone: string) => {
    handlePreferencesSubmit({ timezone })
  }

  const handleDefaultPageChange = (default_page: string) => {
    handlePreferencesSubmit({ default_page })
  }

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    handlePreferencesSubmit({ sidebar_collapsed: collapsed })
  }

  const handleCompactViewChange = (compact: boolean) => {
    handlePreferencesSubmit({ compact_view: compact })
  }

  const handleEmailNotificationChange = (key: string, value: boolean) => {
    if (!preferences) return

    const updatedEmailNotifications = {
      ...preferences.email_notifications,
      [key]: value,
    }

    handlePreferencesSubmit({
      email_notifications: updatedEmailNotifications,
    })
  }

  const handleAppNotificationChange = (key: string, value: boolean) => {
    if (!preferences) return

    const updatedAppNotifications = {
      ...preferences.app_notifications,
      [key]: value,
    }

    handlePreferencesSubmit({
      app_notifications: updatedAppNotifications,
    })
  }

  const handleSignOutAllDevices = () => {
    const signOut = async () => {
      setLoading(true)
      try {
        // Call your sign-out API endpoint here
        // await fetch('/api/signout', { method: 'POST' }); // Example API call
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
        toast({
          title: t("common.success"),
          description: t("settings.signedOutAllDevices"),
        })
        router.push("/login")
      } catch (error) {
        console.error("Error signing out:", error)
        toast({
          title: t("common.error"),
          description: t("settings.failedToSignOut"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    signOut()
  }

  return (
    <div className="flex-1 w-full">
      <div className="w-full">
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="account" className="w-full mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="account">{t("settings.account")}</TabsTrigger>
          <TabsTrigger value="appearance">{t("settings.appearance")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.notifications")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="w-full space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profileInfo")}</CardTitle>
              <CardDescription>{t("settings.profileDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg?height=80&width=80"} alt="User" />
                  <AvatarFallback>{profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    {t("settings.changeAvatar")}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">{t("settings.avatarSizeLimit")}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                  <Input
                    id="firstName"
                    value={profile?.first_name || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, first_name: e.target.value } : null))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                  <Input
                    id="lastName"
                    value={profile?.last_name || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, last_name: e.target.value } : null))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("settings.email")}</Label>
                  <Input id="email" type="email" value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">{t("settings.emailCannotChange")}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">{t("settings.company")}</Label>
                  <Input
                    id="company"
                    value={profile?.company || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, company: e.target.value } : null))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleProfileSubmit} disabled={loading}>
                {loading ? t("common.saving") : t("common.save")}
              </Button>
            </CardFooter>
          </Card>

          <LanguageSettings />

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.languageRegion")}</CardTitle>
              <CardDescription>{t("settings.languageRegionDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="language">{t("settings.language")}</Label>
                <Select value={preferences?.language || "en-US"} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                <Select value={preferences?.timezone || "utc-8"} onValueChange={handleTimezoneChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.selectTimezone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc+0">UTC</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handlePreferencesSubmit({})} disabled={loading}>
                {loading ? t("common.saving") : t("settings.savePreferences")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="w-full space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.theme")}</CardTitle>
              <CardDescription>{t("settings.themeDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="light-theme">{t("settings.lightTheme")}</Label>
                  </div>
                  <Switch
                    id="light-theme"
                    checked={preferences?.theme === "light"}
                    onCheckedChange={(checked) => checked && handleThemeChange("light")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="dark-theme">{t("settings.darkTheme")}</Label>
                  </div>
                  <Switch
                    id="dark-theme"
                    checked={preferences?.theme === "dark"}
                    onCheckedChange={(checked) => checked && handleThemeChange("dark")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="system-theme">{t("settings.systemTheme")}</Label>
                  </div>
                  <Switch
                    id="system-theme"
                    checked={preferences?.theme === "system" || !preferences?.theme}
                    onCheckedChange={(checked) => checked && handleThemeChange("system")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handlePreferencesSubmit({})} disabled={loading}>
                {loading ? t("common.saving") : t("settings.savePreferences")}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.dashboardLayout")}</CardTitle>
              <CardDescription>{t("settings.dashboardLayoutDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sidebar-collapsed">{t("settings.collapsedSidebar")}</Label>
                  <Switch
                    id="sidebar-collapsed"
                    checked={preferences?.sidebar_collapsed || false}
                    onCheckedChange={handleSidebarCollapsedChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">{t("settings.compactView")}</Label>
                  <Switch
                    id="compact-view"
                    checked={preferences?.compact_view || false}
                    onCheckedChange={handleCompactViewChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="default-page">{t("settings.defaultLandingPage")}</Label>
                  <Select value={preferences?.default_page || "dashboard"} onValueChange={handleDefaultPageChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.selectDefaultPage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">{t("common.dashboard")}</SelectItem>
                      <SelectItem value="videos">{t("common.videos")}</SelectItem>
                      <SelectItem value="avatars">{t("common.avatars")}</SelectItem>
                      <SelectItem value="voice-cloning">{t("common.voices")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handlePreferencesSubmit({})} disabled={loading}>
                {loading ? t("common.saving") : t("settings.savePreferences")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="w-full space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notificationPreferences")}</CardTitle>
              <CardDescription>{t("settings.notificationDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.emailNotifications")}</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-processing-complete">{t("settings.processingComplete")}</Label>
                      <Switch
                        id="email-processing-complete"
                        checked={preferences?.email_notifications?.processing_complete || false}
                        onCheckedChange={(checked) => handleEmailNotificationChange("processing_complete", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-new-features">{t("settings.newFeatures")}</Label>
                      <Switch
                        id="email-new-features"
                        checked={preferences?.email_notifications?.new_features || false}
                        onCheckedChange={(checked) => handleEmailNotificationChange("new_features", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-tips">{t("settings.tips")}</Label>
                      <Switch
                        id="email-tips"
                        checked={preferences?.email_notifications?.tips || false}
                        onCheckedChange={(checked) => handleEmailNotificationChange("tips", checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.inAppNotifications")}</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-processing-complete">{t("settings.processingComplete")}</Label>
                      <Switch
                        id="app-processing-complete"
                        checked={preferences?.app_notifications?.processing_complete || false}
                        onCheckedChange={(checked) => handleAppNotificationChange("processing_complete", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-new-features">{t("settings.newFeatures")}</Label>
                      <Switch
                        id="app-new-features"
                        checked={preferences?.app_notifications?.new_features || false}
                        onCheckedChange={(checked) => handleAppNotificationChange("new_features", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-tips">{t("settings.tips")}</Label>
                      <Switch
                        id="app-tips"
                        checked={preferences?.app_notifications?.tips || false}
                        onCheckedChange={(checked) => handleAppNotificationChange("tips", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handlePreferencesSubmit({})} disabled={loading}>
                {loading ? t("common.saving") : t("settings.savePreferences")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="w-full space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.changePassword")}</CardTitle>
              <CardDescription>{t("settings.changePasswordDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">{t("settings.confirmPassword")}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                <Button type="submit" disabled={loading}>
                  {loading ? t("settings.updating") : t("settings.updatePassword")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.twoFactorAuth")}</CardTitle>
              <CardDescription>{t("settings.twoFactorDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{t("settings.twoFactorAuth")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t("settings.twoFactorDescription")}</p>
                </div>
                <Switch id="two-factor" disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>
                {t("settings.setup2FA")}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.sessions")}</CardTitle>
              <CardDescription>{t("settings.sessionsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{t("settings.currentSession")}</p>
                    <p className="text-sm text-muted-foreground">{t("settings.currentBrowser")}</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Current</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={handleSignOutAllDevices}
                disabled={loading}
              >
                {t("common.signOutAllDevices")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
