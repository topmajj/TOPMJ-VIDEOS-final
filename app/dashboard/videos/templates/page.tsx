"use client"
import { Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Sample data
const templates = [
  {
    id: "1",
    title: "Product Demo",
    description: "Showcase your product features",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "2",
    title: "Company Introduction",
    description: "Introduce your company and team",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "3",
    title: "Tutorial",
    description: "Create a step-by-step guide",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "4",
    title: "Testimonial",
    description: "Share customer success stories",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "5",
    title: "Announcement",
    description: "Make important announcements",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "6",
    title: "Explainer",
    description: "Explain complex concepts simply",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

export default function TemplatesPage() {
  return (
    <div className="mt-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={template.thumbnail || "/placeholder.svg"}
                alt={template.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <Button size="icon" variant="secondary" className="h-10 w-10">
                  <Play className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
