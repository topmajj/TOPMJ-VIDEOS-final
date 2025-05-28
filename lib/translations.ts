import enTranslations from "@/translations/en.json"
import arTranslations from "@/translations/ar.json"

type TranslationKey = string

export function getTranslation(key: TranslationKey, language = "en"): string {
  const keys = key.split(".")
  let translation: any = language === "ar" ? arTranslations : enTranslations

  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k]
    } else {
      return key // Return the key if translation not found
    }
  }

  return typeof translation === "string" ? translation : key
}
