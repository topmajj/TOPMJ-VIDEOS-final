"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhotoAvatarsList } from "@/components/photo-avatars-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function PhotoAvatarsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "Young Adult",
    gender: "Woman",
    ethnicity: "Asian American",
    orientation: "horizontal",
    pose: "half_body",
    style: "Realistic",
    appearance: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.appearance) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/heygen/photo-avatars/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate avatar")
      }

      toast({
        title: "Avatar generation started",
        description: "Your avatar is being generated. This may take a few minutes.",
      })

      // Reset form
      setFormData({
        name: "",
        age: "Young Adult",
        gender: "Woman",
        ethnicity: "Asian American",
        orientation: "horizontal",
        pose: "half_body",
        style: "Realistic",
        appearance: "",
      })

      // Refresh the list
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate avatar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Avatars</TabsTrigger>
          <TabsTrigger value="create">Create Avatar</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PhotoAvatarsList />
        </TabsContent>

        <TabsContent value="create">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Create AI Photo Avatar</CardTitle>
                <CardDescription>Generate a realistic AI photo avatar using Topmaj API</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Avatar Name*</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter avatar name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="age">Age</Label>
                        <Select value={formData.age} onValueChange={(value) => handleSelectChange("age", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Young Adult">Young Adult</SelectItem>
                            <SelectItem value="Early Middle Age">Early Middle Age</SelectItem>
                            <SelectItem value="Late Middle Age">Late Middle Age</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Unspecified">Unspecified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Man">Man</SelectItem>
                            <SelectItem value="Woman">Woman</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="ethnicity">Ethnicity</Label>
                        <Select
                          value={formData.ethnicity}
                          onValueChange={(value) => handleSelectChange("ethnicity", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ethnicity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asian American">Asian American</SelectItem>
                            <SelectItem value="Black">Black</SelectItem>
                            <SelectItem value="Hispanic">Hispanic</SelectItem>
                            <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                            <SelectItem value="White">White</SelectItem>
                            <SelectItem value="South Asian">South Asian</SelectItem>
                            <SelectItem value="Southeast Asian">Southeast Asian</SelectItem>
                            <SelectItem value="East Asian">East Asian</SelectItem>
                            <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                            <SelectItem value="Native American">Native American</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="orientation">Orientation</Label>
                        <Select
                          value={formData.orientation}
                          onValueChange={(value) => handleSelectChange("orientation", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select orientation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="horizontal">Horizontal</SelectItem>
                            <SelectItem value="vertical">Vertical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="pose">Pose</Label>
                        <Select value={formData.pose} onValueChange={(value) => handleSelectChange("pose", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="half_body">Half Body</SelectItem>
                            <SelectItem value="full_body">Full Body</SelectItem>
                            <SelectItem value="head_shot">Head Shot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="style">Style</Label>
                        <Select value={formData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Realistic">Realistic</SelectItem>
                            <SelectItem value="Stylized">Stylized</SelectItem>
                            <SelectItem value="Anime">Anime</SelectItem>
                            <SelectItem value="Cartoon">Cartoon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="appearance">Appearance Description*</Label>
                      <Textarea
                        id="appearance"
                        name="appearance"
                        placeholder="Describe the appearance of your avatar in detail"
                        rows={4}
                        value={formData.appearance}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: A stylish East Asian Woman in casual attire walking through a bustling city street
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Avatar"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
