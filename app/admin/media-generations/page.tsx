import type { Metadata } from "next"
import AdminMediaGenerationsContent from "@/components/admin/admin-media-generations-content"

export const metadata: Metadata = {
  title: "Admin | Media Generations",
  description: "Manage all AI-generated media in the system",
}

export default function AdminMediaGenerationsPage() {
  return <AdminMediaGenerationsContent />
}
