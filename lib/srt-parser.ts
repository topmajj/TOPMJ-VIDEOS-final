export interface SubtitleCue {
  id: number
  startTime: number
  endTime: number
  text: string
}

export async function fetchAndParseSubtitles(source: string): Promise<SubtitleCue[]> {
  try {
    let content: string

    // Check if source is a URL or direct content
    if (source.startsWith("http") || source.startsWith("/api/")) {
      console.log("Fetching subtitles from URL:", source)
      const response = await fetch(source)

      if (!response.ok) {
        throw new Error(`Failed to fetch subtitles: ${response.status}`)
      }

      content = await response.text()
    } else {
      // Assume it's direct content
      content = source
    }

    console.log("Content length:", content.length)
    console.log("Content preview:", content.substring(0, 200))

    // Try parsing as JSON first
    try {
      const jsonData = JSON.parse(content)
      console.log("Successfully parsed as JSON")

      // Try different JSON formats
      const jsonResult = parseHappyScribeJSON(jsonData)
      if (jsonResult.length > 0) {
        console.log("Successfully parsed with HappyScribe JSON parser, found", jsonResult.length, "cues")
        return jsonResult
      }

      const wordsResult = parseHappyScribeWordsJSON(jsonData)
      if (wordsResult.length > 0) {
        console.log("Successfully parsed with HappyScribe Words JSON parser, found", wordsResult.length, "cues")
        return wordsResult
      }

      console.log("JSON parsing didn't yield any cues")
    } catch (e) {
      console.log("Not valid JSON, trying SRT format")
    }

    // Try parsing as SRT
    const srtResult = parseSRT(content)
    if (srtResult.length > 0) {
      console.log("Successfully parsed with SRT parser, found", srtResult.length, "cues")
      return srtResult
    }

    console.log("All parsing methods failed")
    return []
  } catch (error) {
    console.error("Error fetching or parsing subtitles:", error)
    return []
  }
}

// Parse standard SRT format
export function parseSRT(srtContent: string): SubtitleCue[] {
  console.log("Parsing SRT content")
  const cues: SubtitleCue[] = []

  // Handle empty content
  if (!srtContent || srtContent.trim() === "") {
    console.log("SRT content is empty")
    return cues
  }

  // Split by double newline to get blocks
  const blocks = srtContent.trim().split(/\r?\n\r?\n/)
  console.log("Found", blocks.length, "blocks in SRT content")

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/)
    if (lines.length < 3) {
      console.log("Skipping block with insufficient lines:", lines)
      continue
    }

    // Parse ID
    const id = Number.parseInt(lines[0].trim(), 10)
    if (isNaN(id)) {
      console.log("Invalid ID:", lines[0])
      continue
    }

    // Parse timestamp - handle both comma and period as decimal separators
    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/)
    if (!timeMatch) {
      console.log("Invalid timestamp format:", lines[1])
      continue
    }

    const startTime =
      Number.parseInt(timeMatch[1], 10) * 3600 +
      Number.parseInt(timeMatch[2], 10) * 60 +
      Number.parseInt(timeMatch[3], 10) +
      Number.parseInt(timeMatch[4], 10) / 1000

    const endTime =
      Number.parseInt(timeMatch[5], 10) * 3600 +
      Number.parseInt(timeMatch[6], 10) * 60 +
      Number.parseInt(timeMatch[7], 10) +
      Number.parseInt(timeMatch[8], 10) / 1000

    // Get text (could be multiple lines)
    const text = lines.slice(2).join("\n")

    cues.push({
      id,
      startTime,
      endTime,
      text,
    })
  }

  console.log("Parsed", cues.length, "cues from SRT")
  return cues
}

// Parse HappyScribe JSON format
export function parseHappyScribeJSON(jsonData: any): SubtitleCue[] {
  console.log("Trying to parse HappyScribe JSON format")
  const cues: SubtitleCue[] = []

  // Check if it's the expected format with paragraphs
  if (!jsonData || !Array.isArray(jsonData.paragraphs)) {
    console.log("No paragraphs array found in JSON")

    // Check if it's a direct array of cues
    if (Array.isArray(jsonData)) {
      console.log("JSON is an array, trying to parse as direct cues array")
      return parseDirectCuesArray(jsonData)
    }

    return cues
  }

  // Process paragraphs
  jsonData.paragraphs.forEach((paragraph: any, index: number) => {
    if (paragraph.start !== undefined && paragraph.end !== undefined) {
      cues.push({
        id: index + 1,
        startTime: paragraph.start,
        endTime: paragraph.end,
        text: paragraph.text || "",
      })
    }
  })

  console.log("Parsed", cues.length, "cues from HappyScribe JSON")
  return cues
}

// Parse direct array of cues
function parseDirectCuesArray(jsonArray: any[]): SubtitleCue[] {
  console.log("Parsing direct array of cues")
  const cues: SubtitleCue[] = []

  jsonArray.forEach((item, index) => {
    // Check if item has necessary properties
    if (item.start !== undefined && item.end !== undefined) {
      cues.push({
        id: index + 1,
        startTime: typeof item.start === "number" ? item.start : Number.parseFloat(item.start),
        endTime: typeof item.end === "number" ? item.end : Number.parseFloat(item.end),
        text: item.text || "",
      })
    }
  })

  console.log("Parsed", cues.length, "cues from direct array")
  return cues
}

// Parse HappyScribe words-based JSON format
export function parseHappyScribeWordsJSON(jsonData: any): SubtitleCue[] {
  console.log("Trying to parse HappyScribe Words JSON format")
  const cues: SubtitleCue[] = []

  if (!jsonData || !Array.isArray(jsonData.words)) {
    console.log("No words array found in JSON")
    return cues
  }

  // Group words into sentences (approximately)
  let currentCue: SubtitleCue | null = null
  let cueId = 1

  jsonData.words.forEach((word: any, index: number) => {
    if (!word.start || !word.end) return

    // Start a new cue if needed
    if (
      !currentCue ||
      word.start - currentCue.endTime > 1 || // Gap larger than 1 second
      currentCue.text.length > 80 || // Text getting too long
      word.end - currentCue.startTime > 5
    ) {
      // Cue duration too long

      if (currentCue) {
        cues.push(currentCue)
      }

      currentCue = {
        id: cueId++,
        startTime: word.start,
        endTime: word.end,
        text: word.text || "",
      }
    } else {
      // Add to existing cue
      currentCue.text += " " + (word.text || "")
      currentCue.endTime = word.end
    }
  })

  // Add the last cue
  if (currentCue) {
    cues.push(currentCue)
  }

  console.log("Parsed", cues.length, "cues from HappyScribe Words JSON")
  return cues
}

export function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
}
