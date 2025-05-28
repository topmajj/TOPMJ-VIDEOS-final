export type ExportState = "pending" | "processing" | "ready" | "expired" | "failed"
export type TranscriptionState =
  | "initial"
  | "ingesting"
  | "automatic_transcribing"
  | "automatic_done"
  | "aligning"
  | "locked"
  | "failed"
  | "demo"
export type OrderState =
  | "incomplete"
  | "waiting_for_payment"
  | "submitted"
  | "locked"
  | "fulfilled"
  | "failed"
  | "canceled"
  | "expired"
  | "free_trial_submitted"
  | "free_trial_fulfilled"

export interface HappyScribeExport {
  id: string
  state: ExportState
  format: string
  download_link?: string | null // Only present when state is 'ready'
  show_timestamps?: boolean
  show_speakers?: boolean
  show_comments?: boolean
  show_highlights?: boolean
  transcription_ids?: string[]
}

export interface HappyScribeTranscription {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  state: TranscriptionState
  sharingEnabled: boolean
  shareCode?: string
  language: string
  audioLengthInSeconds: number | null
  costInCents?: number
  refunded?: boolean
  tags?: string[]
  _links?: {
    self?: {
      editorUrl?: string
      downloadUrl?: string
    }
  }
  failureReason?: string | null
  failureMessage?: string | null
}

export interface HappyScribeOrder {
  id: string
  folder_id: number
  state: OrderState
  operations: OrderOperation[]
  details: OrderDetails
  inputs: OrderInput[]
  outputsCount: number
  canBeSubmitted: boolean
  currentUserIsPayer: boolean
  needsMoneyWalletTopup: boolean
  addons: any[]
  duplicates: any[]
  suggestedLanguages: string[]
  detectedLanguage: string | null
}

export interface OrderOperation {
  name: string
  type: "auto" | "pro"
  language: string
  target_language?: string
  glossary_ids: string[]
  use_vocab?: boolean
}

export interface OrderDetails {
  items: OrderItem[]
  pricing_unit_name: string
  pricing_unit_total_count: number
  total_cents: number
  total_credits: number | null
  currency: string
  currency_symbol: string
  addons_total_cents: Record<string, number>
  minimum_charge: number
}

export interface OrderItem {
  id: number
  filename: string
  pricing_unit_name: string
  pricing_unit_count: number
  service: OrderOperation
  addon_id: string | null
  addon_name: string | null
  turnaround_minutes: number
  cents_per_unit: number
  cents: number
  credits: number | null
}

export interface OrderInput {
  transcription_id: string
}

export interface CreateTranscriptionRequest {
  name: string
  language: string
  tmp_url: string
  is_subtitle?: boolean
  service?: "auto" | "pro" | "alignment"
  folder?: string
  folder_id?: string
  sharing_enabled?: boolean
  tags?: string[]
}

export interface CreateExportRequest {
  format: "txt" | "docx" | "pdf" | "srt" | "vtt" | "stl" | "avid" | "html" | "premiere" | "maxqda" | "json" | "fcp"
  transcription_ids: string[]
  show_timestamps?: boolean
  timestamps_frequency?: "5s" | "10s" | "15s" | "20s" | "30s" | "60s"
  show_speakers?: boolean
  show_comments?: boolean
  show_highlights?: boolean
  show_highlights_only?: boolean
}

export interface CreateOrderRequest {
  source_transcription_id: string
  target_languages: string[]
  service: "auto" | "pro"
  confirm: boolean
}

export interface TranslationRequest {
  video_url: string
  output_language: string
  title: string
}
