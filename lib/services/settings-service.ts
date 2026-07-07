import { sql } from '@/lib/db'
import { cacheLife } from 'next/cache'
import { cacheTag } from 'next/cache'
import type { SettingsRow } from '@/types/database'

// Direct database read (uncached) - used after writes to get fresh value
async function getResumeVisibilityDirect(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT value FROM settings
      WHERE key = 'resume_visible'
      LIMIT 1
    ` as SettingsRow[]

    return result.length > 0 ? result[0].value === 'true' : true
  } catch (error: unknown) {
    // If table doesn't exist, default to visible
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      errorMessage.includes('does not exist') ||
      errorMessage.includes('relation') ||
      (error as { code?: string }).code === '42P01'
    ) {
      return true
    }
    throw error
  }
}

// Cached version of getResumeVisibility
async function getCachedResumeVisibility(): Promise<boolean> {
  'use cache'
  cacheLife('resume-data')
  cacheTag('resume-visibility')

  try {
    return await getResumeVisibilityDirect()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error fetching cached resume visibility:', errorMessage)
    return true
  }
}

export const settingsService = {
  async getResumeVisibility(): Promise<boolean> {
    return getCachedResumeVisibility()
  },

  // Returns the updated value after setting
  async setResumeVisibility(isVisible: boolean): Promise<boolean> {
    const valueString = isVisible.toString()

    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('resume_visible', ${valueString}, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = ${valueString}, updated_at = NOW()
    `

    // Return fresh value directly from DB (bypassing cache)
    return getResumeVisibilityDirect()
  },
}
