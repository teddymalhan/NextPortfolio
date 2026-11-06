export interface ResumeResponse {
  id: number
  filename: string
  path: string
  blob_url: string
  isActive: boolean
  uploadedAt: string
  fileSize?: number | null
  notes?: string | null
}

export interface ResumeDeleteResponse {
  deleted: true
  resume: ResumeResponse
  warning?: string
}


export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export interface VisibilityResponse {
  isVisible: boolean
  warning?: string
}

