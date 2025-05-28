import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Advanced Text to Video",
  description: "Generate videos using Google Veo AI technology",
}

export default function AdvancedTextToVideoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
