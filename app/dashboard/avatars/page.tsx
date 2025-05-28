"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { T } from "@/components/translation"

export default function AvatarsPage() {
  const router = useRouter()

  // Option 1: Automatically redirect to photo-avatars
  // useEffect(() => {
  //   router.push("/dashboard/avatars/photo-avatars")
  // }, [router])

  return (
    <div className="mt-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <T text="avatars.photoAvatars.title" />
            </CardTitle>
            <CardDescription>
              <T text="avatars.photoAvatars.description" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              <T text="avatars.photoAvatars.details" />
            </p>
            <Button onClick={() => router.push("/dashboard/avatars/photo-avatars")}>
              <T text="avatars.photoAvatars.manage" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <T text="avatars.digitalHumans.title" />
            </CardTitle>
            <CardDescription>
              <T text="avatars.digitalHumans.description" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              <T text="avatars.digitalHumans.details" />
            </p>
            <Button variant="outline" disabled>
              <T text="avatars.digitalHumans.comingSoon" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
