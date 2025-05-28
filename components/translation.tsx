"use client"

import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import type { ReactNode } from "react"

interface TranslateProps {
  text: string
  children?: ReactNode
}

export function T({ text, children }: TranslateProps) {
  const { language } = useLanguage()

  if (children) {
    return <>{children}</>
  }

  return <>{getTranslation(text, language)}</>
}

// Add the Translation component as a named export (alias for T)
export const Translation = T
