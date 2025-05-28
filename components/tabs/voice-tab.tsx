"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VoiceList } from "@/components/voice-list"
import { T } from "@/components/t"

export function VoiceTab() {
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
            <T>Clone Voice</T>
          </CardTitle>
          <CardDescription>
            <T>Create a new voice clone using HeyGen API</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  <T>Voice Name</T>
                </Label>
                <Input id="name" placeholder="Enter voice name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="audio">
                  <T>Upload Audio Sample</T>
                </Label>
                <Input id="audio" type="file" accept="audio/*" />
                <p className="text-xs text-muted-foreground">
                  <T>Upload a clear audio sample (30 seconds minimum)</T>
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">
                  <T>Language</T>
                </Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <T>Cloning...</T> : <T>Clone Voice</T>}
          </Button>
        </CardFooter>
      </Card>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>
            <T>Your Voice Clones</T>
          </CardTitle>
          <CardDescription>
            <T>Manage your voice clones</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceList />
        </CardContent>
      </Card>
    </div>
  )
}
