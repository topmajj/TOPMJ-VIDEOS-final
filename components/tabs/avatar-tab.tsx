"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarList } from "@/components/avatar-list"
import { T } from "@/components/t"

export function AvatarTab() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>
            <T text="avatar.create_avatar" />
          </CardTitle>
          <CardDescription>
            <T text="avatar.create_avatar_description" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  <T text="avatar.avatar_name" />
                </Label>
                <Input id="name" placeholder="Enter avatar name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">
                  <T text="avatar.upload_image" />
                </Label>
                <Input id="image" type="file" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">
                  <T text="avatar.avatar_type" />
                </Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="talking-photo">Talking Photo</option>
                  <option value="digital-human">Digital Human</option>
                  <option value="animated">Animated Character</option>
                </select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <T text="avatar.creating" /> : <T text="avatar.create_avatar" />}
          </Button>
        </CardFooter>
      </Card>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>
            <T text="avatar.your_avatars" />
          </CardTitle>
          <CardDescription>
            <T text="avatar.manage_avatars" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarList />
        </CardContent>
      </Card>
    </div>
  )
}
