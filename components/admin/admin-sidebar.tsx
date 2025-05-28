"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { BarChart3, Users, Video, Settings, LogOut, ShieldAlert, Home, Menu, X, Wand2, CreditCard } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Videos",
      href: "/admin/videos",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Media Generations",
      href: "/admin/media-generations",
      icon: <Wand2 className="h-5 w-5" />,
    },
    {
      title: "Subscriptions",
      href: "/admin/subscriptions",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    toast({
      title: "Signed out",
      description: "You have been signed out of the admin panel",
    })
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-50 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full bg-background/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-gradient-to-b from-purple-950 to-indigo-950 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-fuchsia-500">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <span className="hidden text-lg md:inline">Admin Panel</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/50 to-fuchsia-600/50 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-white/10 p-3">
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5" />
              Back to App
            </Link>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
