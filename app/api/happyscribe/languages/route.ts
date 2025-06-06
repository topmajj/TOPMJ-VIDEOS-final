import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Happy Scribe supported languages with their full codes
    const languages = [
      { code: "en-US", name: "English (United States)" },
      { code: "en-GB", name: "English (United Kingdom)" },
      { code: "fr-FR", name: "French (France)" },
      { code: "fr-CA", name: "French (Canada)" },
      { code: "es-ES", name: "Spanish (Spain)" },
      { code: "es-MX", name: "Spanish (Mexico)" },
      { code: "de-DE", name: "German (Germany)" },
      { code: "it-IT", name: "Italian (Italy)" },
      { code: "pt-BR", name: "Portuguese (Brazil)" },
      { code: "pt-PT", name: "Portuguese (Portugal)" },
      { code: "nl-NL", name: "Dutch (Netherlands)" },
      { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
      { code: "ar-EG", name: "Arabic (Egypt)" },
      { code: "cmn-Hans-CN", name: "Chinese, Mandarin (Simplified)" },
      { code: "ja-JP", name: "Japanese (Japan)" },
      { code: "ko-KR", name: "Korean (South Korea)" },
      { code: "ru-RU", name: "Russian (Russia)" },
      { code: "hi-IN", name: "Hindi (India)" },
      { code: "tr-TR", name: "Turkish (Turkey)" },
      { code: "pl-PL", name: "Polish (Poland)" },
      { code: "sv-SE", name: "Swedish (Sweden)" },
      { code: "da-DK", name: "Danish (Denmark)" },
      { code: "nb-NO", name: "Norwegian Bokmål (Norway)" },
      { code: "fi-FI", name: "Finnish (Finland)" },
      { code: "el-GR", name: "Greek (Greece)" },
      { code: "he-IL", name: "Hebrew (Israel)" },
      { code: "th-TH", name: "Thai (Thailand)" },
      { code: "vi-VN", name: "Vietnamese (Vietnam)" },
      { code: "id-ID", name: "Indonesian (Indonesia)" },
      { code: "ms-MY", name: "Malay (Malaysia)" },
      { code: "uk-UA", name: "Ukrainian (Ukraine)" },
      { code: "cs-CZ", name: "Czech (Czech Republic)" },
      { code: "hu-HU", name: "Hungarian (Hungary)" },
      { code: "ro-RO", name: "Romanian (Romania)" },
      { code: "bg-BG", name: "Bulgarian (Bulgaria)" },
      { code: "hr-HR", name: "Croatian (Croatia)" },
      { code: "sk-SK", name: "Slovak (Slovakia)" },
      { code: "sl-SI", name: "Slovenian (Slovenia)" },
      { code: "lt-LT", name: "Lithuanian (Lithuania)" },
      { code: "lv-LV", name: "Latvian (Latvia)" },
      { code: "et-EE", name: "Estonian (Estonia)" },
      { code: "ca-ES", name: "Catalan (Spain)" },
      { code: "eu-ES", name: "Basque (Spain)" },
      { code: "gl-ES", name: "Galician (Spain)" },
      { code: "af-ZA", name: "Afrikaans (South Africa)" },
      { code: "sw-KE", name: "Swahili (Kenya)" },
      { code: "am-ET", name: "Amharic (Ethiopia)" },
      { code: "ne-NP", name: "Nepali (Nepal)" },
      { code: "bn-IN", name: "Bengali (India)" },
      { code: "ta-IN", name: "Tamil (India)" },
      { code: "te-IN", name: "Telugu (India)" },
      { code: "mr-IN", name: "Marathi (India)" },
      { code: "gu-IN", name: "Gujarati (India)" },
      { code: "kn-IN", name: "Kannada (India)" },
      { code: "ml-IN", name: "Malayalam (India)" },
      { code: "pa-Guru-IN", name: "Punjabi (India)" },
      { code: "ur-PK", name: "Urdu (Pakistan)" },
      { code: "fa-IR", name: "Persian (Iran)" },
      { code: "az-AZ", name: "Azerbaijani (Azerbaijan)" },
      { code: "hy-AM", name: "Armenian (Armenia)" },
      { code: "ka-GE", name: "Georgian (Georgia)" },
      { code: "is-IS", name: "Icelandic (Iceland)" },
      { code: "sq-AL", name: "Albanian (Albania)" },
      { code: "mk-MK", name: "Macedonian (North Macedonia)" },
      { code: "sr-RS", name: "Serbian (Serbia)" },
      { code: "bs-BA", name: "Bosnian (Bosnia and Herzegovina)" },
      { code: "mn-MN", name: "Mongolian (Mongolia)" },
      { code: "my-MM", name: "Burmese (Myanmar)" },
      { code: "km-KH", name: "Khmer (Cambodia)" },
      { code: "lo-LA", name: "Lao (Laos)" },
      { code: "si-LK", name: "Sinhala (Sri Lanka)" },
      { code: "uz-UZ", name: "Uzbek (Uzbekistan)" },
      { code: "be-BY", name: "Belarusian (Belarus)" },
      { code: "zu-ZA", name: "Zulu (South Africa)" },
      { code: "fil-PH", name: "Filipino (Philippines)" },
      { code: "jv-ID", name: "Javanese (Indonesia)" },
      { code: "su-ID", name: "Sundanese (Indonesia)" },
      { code: "gsw-CH", name: "Swiss German (Switzerland)" },
      { code: "yue-Hant-HK", name: "Chinese, Cantonese (Hong Kong)" },
    ]

    return NextResponse.json({ data: { languages } })
  } catch (error) {
    console.error("Error fetching languages:", error)
    return NextResponse.json({ error: "Failed to fetch languages" }, { status: 500 })
  }
}
