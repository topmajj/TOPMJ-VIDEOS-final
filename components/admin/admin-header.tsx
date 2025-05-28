"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"

export default function AdminHeader() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url")
          .eq("id", user.id)
          .single()

        setUser({
          ...user,
          profile: data,
        })
      }
    }

    getUser()
  }, [supabase])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-2 md:hidden">{/* Admin text removed from mobile view */}</div>

      <div className="hidden w-full max-w-sm md:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">
            3
          </span>
        </Button>

        <ModeToggle />

        <div className="flex items-center gap-2">
          {user?.profile?.avatar_url ? (
            <img
              src={user.profile.avatar_url || "/placeholder.svg"}
              alt="User"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white">
              {user?.profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
          )}
          <div className="hidden text-sm md:block">
            <p className="font-medium">
              {user?.profile?.first_name
                ? `${user.profile.first_name} ${user.profile.last_name || ""}`
                : user?.email?.split("@")[0] || "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}
