import { NextRequest, connection } from 'next/server'
import { getAdminUserId } from '@/lib/auth'
import { resumeService } from '@/lib/services/resume-service'
import { createErrorResponse, createSuccessResponse, logError } from '@/lib/api-response'
import { resumeVisibilitySchema } from '@/lib/validations/resume'
import type { VisibilityResponse } from '@/types/api'
import { capturePostHogEvent } from '@/lib/posthog-server'

export async function GET() {
  await connection()
  const isVisible = await resumeService.getResumeVisibility()
  await capturePostHogEvent('api_resume_visibility_fetched', {
    endpoint: '/api/resume/visibility', method: 'GET', isVisible,
  })
  return createSuccessResponse<VisibilityResponse>({ isVisible })
}

export async function POST(request: NextRequest) {
  await connection()
  let userId: string | null = null
  try {
    userId = await getAdminUserId()
    if (!userId) {
      await capturePostHogEvent('api_resume_visibility_unauthorized', { endpoint: '/api/resume/visibility', method: 'POST' })
      return createErrorResponse('Unauthorized', 403, 'UNAUTHORIZED')
    }
    const validation = resumeVisibilitySchema.safeParse(await request.json().catch(() => null))
    if (!validation.success) {
      const error = validation.error.issues[0]?.message || 'Invalid request'
      await capturePostHogEvent('api_resume_visibility_validation_error', {
        endpoint: '/api/resume/visibility', method: 'POST', error,
      }, userId)
      return createErrorResponse(error, 400, 'VALIDATION_ERROR')
    }
    const isVisible = await resumeService.setResumeVisibility(validation.data.isVisible)
    await capturePostHogEvent('api_resume_visibility_updated', {
      endpoint: '/api/resume/visibility', method: 'POST', isVisible,
    }, userId)
    return createSuccessResponse<VisibilityResponse>({ isVisible })
  } catch (error) {
    logError('POST /api/resume/visibility', error)
    await capturePostHogEvent('api_resume_visibility_update_error', {
      endpoint: '/api/resume/visibility', method: 'POST', error: error instanceof Error ? error.message : 'Unknown error',
    }, userId ?? 'anonymous')
    return createErrorResponse('Failed to update resume visibility', 500, 'UPDATE_ERROR')
  }
}
