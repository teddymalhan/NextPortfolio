import { z } from 'zod'

export const resumeFilenameSchema = z.string().trim().min(1, 'Filename is required').max(255)
export const resumeIdSchema = z.number().int().positive().max(2147483647)

export function parseResumeId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null
  const result = resumeIdSchema.safeParse(Number(value))
  return result.success ? result.data : null
}

export const resumeUpdateSchema = z.object({
  notes: z.string().max(5000).nullable().optional(),
  filename: resumeFilenameSchema.optional(),
}).refine(
  (data) => data.notes !== undefined || data.filename !== undefined,
  {
    message: 'At least one field (notes or filename) must be provided',
  }
)

export const setActiveResumeSchema = z.object({
  resumeId: resumeIdSchema,
})

export const resumeVisibilitySchema = z.object({
  isVisible: z.boolean(),
})

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024

export function validateFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' }
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  const filename = resumeFilenameSchema.safeParse(file.name)
  if (!filename.success) {
    return { valid: false, error: filename.error.issues[0]?.message || 'Invalid filename' }
  }

  return { valid: true }
}

