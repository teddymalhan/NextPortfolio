import { put, del } from '@vercel/blob'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { sql } from '@/lib/db'
import { logError } from '@/lib/api-response'
import { resumeUpdateSchema, resumeFilenameSchema, resumeIdSchema, validateFile } from '@/lib/validations/resume'
import type { ResumeRow, SettingsRow } from '@/types/database'
import type { ResumeResponse, ResumeDeleteResponse } from '@/types/api'

export class ResumeOperationError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string) {
    super(message)
    this.name = 'ResumeOperationError'
  }
}

function mapResume(row: ResumeRow): ResumeResponse {
  return {
    id: row.id,
    filename: row.filename,
    path: row.blob_url,
    blob_url: row.blob_url,
    isActive: row.is_active,
    uploadedAt: typeof row.uploaded_at === 'string' ? row.uploaded_at : row.uploaded_at.toISOString(),
    fileSize: row.file_size ?? undefined,
    notes: row.notes,
  }
}

function requireId(id: number): number {
  if (!resumeIdSchema.safeParse(id).success) {
    throw new ResumeOperationError('Invalid resume ID', 400, 'INVALID_RESUME_ID')
  }
  return id
}

function invalidateActiveResume() {
  revalidateTag('active-resume', { expire: 0 })
}

async function getActiveResume(): Promise<ResumeResponse | null> {
  'use cache'
  cacheLife('resume-data')
  cacheTag('active-resume')
  const rows = await sql`SELECT * FROM resumes WHERE is_active = TRUE LIMIT 1` as ResumeRow[]
  return rows[0] ? mapResume(rows[0]) : null
}

async function getResumeVisibility(): Promise<boolean> {
  'use cache'
  cacheLife('resume-data')
  cacheTag('resume-visibility')
  // Website visibility historically defaults to visible, including unconfigured or failed storage.
  try {
    const rows = await sql`SELECT value FROM settings WHERE key = 'resume_visible' LIMIT 1` as SettingsRow[]
    return rows[0] ? rows[0].value === 'true' : true
  } catch (error) {
    logError('Resume visibility fallback', error)
    return true
  }
}

export const resumeService = {
  getActiveResume,
  getResumeVisibility,

  async getAllResumes(): Promise<ResumeResponse[]> {
    const rows = await sql`SELECT * FROM resumes ORDER BY uploaded_at DESC` as ResumeRow[]
    return rows.map(mapResume)
  },

  async uploadResume(file: File, uploadedBy: string): Promise<ResumeResponse> {
    const validation = validateFile(file)
    if (!validation.valid) {
      throw new ResumeOperationError(validation.error!, 400, 'INVALID_FILE')
    }
    const filename = resumeFilenameSchema.parse(file.name)
    const blob = await put('resumes/resume.pdf', file, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: true,
    })
    try {
      const rows = await sql`
        INSERT INTO resumes (filename, blob_url, blob_key, uploaded_by, file_size, mime_type)
        VALUES (${filename}, ${blob.url}, ${blob.pathname}, ${uploadedBy}, ${file.size}, ${file.type})
        RETURNING *
      ` as ResumeRow[]
      if (!rows[0]) throw new Error('Failed to create resume')
      return mapResume(rows[0])
    } catch (error) {
      try {
        await del(blob.url)
      } catch (cleanupError) {
        console.error('Resume upload cleanup failed', { blobUrl: blob.url, blobPathname: blob.pathname, error, cleanupError })
        throw new ResumeOperationError(
          'Upload metadata failed and the public file could not be cleaned up. Check Blob storage before uploading again.',
          500,
          'UPLOAD_CLEANUP_ERROR',
        )
      }
      throw error
    }
  },

  async updateResume(id: number, updates: { notes?: string | null; filename?: string }): Promise<ResumeResponse> {
    requireId(id)
    const validation = resumeUpdateSchema.safeParse(updates)
    if (!validation.success) {
      throw new ResumeOperationError(validation.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR')
    }
    const { notes, filename } = validation.data
    const rows = await sql`
      UPDATE resumes
      SET notes = CASE WHEN ${notes !== undefined} THEN ${notes ?? null} ELSE notes END,
          filename = CASE WHEN ${filename !== undefined} THEN ${filename ?? null} ELSE filename END
      WHERE id = ${id}
      RETURNING *
    ` as ResumeRow[]
    if (!rows[0]) throw new ResumeOperationError('Resume not found', 404, 'RESUME_NOT_FOUND')
    if (rows[0].is_active) invalidateActiveResume()
    return mapResume(rows[0])
  },

  async deleteResume(id: number): Promise<ResumeDeleteResponse> {
    requireId(id)
    // Claim deletion in SQL before touching public bytes; activation cannot race this inactive-only predicate.
    const rows = await sql`DELETE FROM resumes WHERE id = ${id} AND is_active = FALSE RETURNING *` as ResumeRow[]
    if (!rows[0]) {
      const existing = await sql`SELECT id FROM resumes WHERE id = ${id}` as Pick<ResumeRow, 'id'>[]
      if (existing.length > 0) {
        throw new ResumeOperationError('Cannot delete active resume. Set another resume as active first.', 400, 'CANNOT_DELETE_ACTIVE')
      }
      throw new ResumeOperationError('Resume not found', 404, 'RESUME_NOT_FOUND')
    }
    const resume = mapResume(rows[0])
    try {
      await del(rows[0].blob_url)
      return { deleted: true, resume }
    } catch (error) {
      console.error('Resume deletion Blob cleanup failed', { blobUrl: rows[0].blob_url, blobPathname: rows[0].blob_key, error })
      return {
        deleted: true,
        resume,
        warning: 'The version was deleted, but its public Blob could not be removed. Remove the orphaned file from Blob storage; its previously shared URL may still work.',
      }
    }
  },

  async setActiveResume(id: number): Promise<ResumeResponse> {
    requireId(id)
    const rows = await sql`SELECT * FROM activate_resume(${id})` as ResumeRow[]
    if (!rows[0]) throw new ResumeOperationError('Resume not found', 404, 'RESUME_NOT_FOUND')
    invalidateActiveResume()
    return mapResume(rows[0])
  },

  async setResumeVisibility(isVisible: boolean): Promise<boolean> {
    const rows = await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('resume_visible', ${String(isVisible)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      RETURNING value
    ` as Pick<SettingsRow, 'value'>[]
    if (!rows[0]) throw new Error('Failed to update resume visibility')
    revalidateTag('resume-visibility', { expire: 0 })
    revalidateTag('home-page', { expire: 0 })
    return rows[0].value === 'true'
  },
}
