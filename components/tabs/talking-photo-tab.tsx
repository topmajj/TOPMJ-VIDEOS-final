"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TalkingPhotoList } from "@/components/talking-photo-list"
import { T } from "@/components/t"

export function TalkingPhotoTab() {
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
            <T>Create Talking Photo</T>
          </CardTitle>
          <CardDescription>
            <T>Animate a photo to speak using HeyGen API</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="photo">
                  <T>Upload Photo</T>
                </Label>
                <Input id="photo" type="file" accept="image/*" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="voice">
                  <T>Voice</T>
                </Label>
                <select
                  id="voice"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="en-US-1">English (US) - Female</option>
                  <option value="en-US-2">English (US) - Male</option>
                  <option value="en-GB-1">English (UK) - Female</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="script">
                  <T>Script</T>
                </Label>
                <Textarea
                  id="script"
                  placeholder={<T>Enter what you want the photo to say...</T>}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <T>Creating...</T> : <T>Create Talking Photo</T>}
          </Button>
        </CardFooter>
      </Card>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>
            <T>Your Talking Photos</T>
          </CardTitle>
          <CardDescription>
            <T>Manage your talking photos</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TalkingPhotoList />
        </CardContent>
      </Card>
    </div>
  )
}
