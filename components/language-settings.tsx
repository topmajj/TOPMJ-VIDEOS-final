"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { T } from "@/components/t"

export function LanguageSettings() {
  const { language, setLanguage } = useLanguage()
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [loading, setLoading] = useState(false)

  const handleLanguageChange = (value: "en" | "ar") => {
    setSelectedLanguage(value)
  }

  const handleSave = () => {
    setLoading(true)
    setLanguage(selectedLanguage)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <T text="settings.language" />
        </CardTitle>
        <CardDescription>
          <T text="settings.languageRegionDescription" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange as (value: string) => void}>
          <div className="flex items-center space-x-2 space-y-0 mb-4">
            <RadioGroupItem value="en" id="en" />
            <Label htmlFor="en">English</Label>
          </div>
          <div className="flex items-center space-x-2 space-y-0">
            <RadioGroupItem value="ar" id="ar" />
            <Label htmlFor="ar">العربية (Arabic)</Label>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <T text="common.saving" /> : <T text="common.save" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
