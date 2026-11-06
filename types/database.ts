export interface ResumeRow {
  id: number
  filename: string
  blob_url: string
  blob_key: string
  is_active: boolean
  uploaded_by: string | null
  uploaded_at: Date | string
  file_size: number | null
  mime_type: string
  notes: string | null
}

export interface SettingsRow {
  id: number
  key: string
  value: string
  updated_at: Date | string | null
}

