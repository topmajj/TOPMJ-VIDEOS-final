"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Play } from "lucide-react"

export default function VoiceLibraryPage() {
  return (
    <div className="mt-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Library Voice {i + 1}</CardTitle>
              <CardDescription>
                {["English (US)", "English (UK)", "Spanish", "French", "German", "Italian"][i % 6]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mic className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {["Female", "Male", "Female", "Male", "Female", "Male"][i % 6]} Voice
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {["Professional", "Casual", "Energetic", "Calm", "Authoritative", "Friendly"][i % 6]}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="ml-auto">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" className="w-full">
                Use This Voice
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
