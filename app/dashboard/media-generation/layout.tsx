import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Media Generation - HeyGen Dashboard",
  description: "Generate AI content with topmaj",
}

export default function MediaGenerationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="space-y-6">{children}</div>
}
