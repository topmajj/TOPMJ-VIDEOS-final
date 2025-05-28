"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateTalkingPhotoPage() {
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
    <div className="mt-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Talking Photo</CardTitle>
          <CardDescription>Animate a photo to speak using HeyGen API</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter a title for your talking photo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="photo">Upload Photo</Label>
                <Input id="photo" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground">Upload a clear photo with a visible face</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="voice">Voice</Label>
                <Select defaultValue="en-US-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US-1">English (US) - Female</SelectItem>
                    <SelectItem value="en-US-2">English (US) - Male</SelectItem>
                    <SelectItem value="en-GB-1">English (UK) - Female</SelectItem>
                    <SelectItem value="custom">Use My Custom Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="script">Script</Label>
                <Textarea id="script" placeholder="Enter what you want the photo to say..." className="min-h-[150px]" />
                <p className="text-xs text-muted-foreground">Maximum 1000 characters</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="background">Background</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Transparent)</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="custom">Upload Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Talking Photo"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
