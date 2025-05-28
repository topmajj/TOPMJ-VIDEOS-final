"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { CreditCard, LayoutDashboard, Play, Settings, Users, Video, Wand2, Languages, Sparkles } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useLanguage } from "@/lib/language-context"
import { T } from "@/components/t"
import { getTranslation } from "@/lib/translations"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { language } = useLanguage()

  // Determine if we're in RTL mode
  const isRTL = language === "ar"

  // Styles for RTL mode - this is the key part that positions the sidebar
  const rtlStyles = isRTL
    ? {
        position: "fixed" as const,
        right: 0,
        left: "auto",
        top: 0,
        bottom: 0,
        borderRight: "none",
        borderLeft: "1px solid var(--border)",
        zIndex: 40,
      }
    : {}

  const navItems = [
    {
      title: getTranslation("common.dashboard", language),
      icon: LayoutDashboard,
      href: "/dashboard",
      isActive: pathname === "/dashboard",
    },
    {
      title: getTranslation("common.videos", language),
      icon: Video,
      href: "/dashboard/videos",
      isActive: pathname === "/dashboard/videos" || pathname.startsWith("/dashboard/videos/"),
    },
    {
      title: getTranslation("videoTranslations.title", language),
      icon: Languages,
      href: "/dashboard/video-translations",
      isActive: pathname === "/dashboard/video-translations" || pathname.startsWith("/dashboard/video-translations/"),
    },
    {
      title: getTranslation("advancedTextToVideo.title", language),
      icon: Sparkles,
      href: "/dashboard/advanced-text-to-video",
      isActive:
        pathname === "/dashboard/advanced-text-to-video" || pathname.startsWith("/dashboard/advanced-text-to-video/"),
    },
    {
      title: getTranslation("common.avatars", language),
      icon: Users,
      href: "/dashboard/avatars",
      isActive: pathname === "/dashboard/avatars" || pathname.startsWith("/dashboard/avatars/"),
    },
    {
      title: getTranslation("mediaGeneration.title", language),
      icon: Wand2,
      href: "/dashboard/media-generation",
      isActive: pathname === "/dashboard/media-generation" || pathname.startsWith("/dashboard/media-generation/"),
    },
  ]

  const utilityItems = [
    {
      title: getTranslation("credits.title", language),
      icon: CreditCard,
      href: "/dashboard/credits",
      isActive: pathname === "/dashboard/credits",
    },
    {
      title: getTranslation("settings.title", language),
      icon: Settings,
      href: "/dashboard/settings",
      isActive: pathname === "/dashboard/settings",
    },
  ]

  return (
    <Sidebar
      className="w-64 flex-shrink-0"
      style={{
        ...rtlStyles,
        width: "16rem",
        minWidth: "16rem",
        maxWidth: "16rem",
      }}
    >
      <SidebarHeader className="border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                  <div className="font-semibold">TopMaj</div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <T text="common.main" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={
                      item.isActive
                        ? "bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 text-primary"
                        : ""
                    }
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>
            <T text="common.settings" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={
                      item.isActive
                        ? "bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 text-primary"
                        : ""
                    }
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">
          <p className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-medium">
            <T text="common.copyright" />
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
