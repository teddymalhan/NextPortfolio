import { NextRequest, connection } from 'next/server'
import { getAdminUserId } from '@/lib/auth'
import { resumeService, ResumeOperationError } from '@/lib/services/resume-service'
import { createErrorResponse, createSuccessResponse, logError } from '@/lib/api-response'
import { setActiveResumeSchema } from '@/lib/validations/resume'
import { capturePostHogEvent } from '@/lib/posthog-server'

export async function PUT(request: NextRequest) {
  await connection()
  let userId: string | null = null
  try {
    userId = await getAdminUserId()
    if (!userId) {
      await capturePostHogEvent('api_resume_active_unauthorized', {
        endpoint: '/api/resume/active',
        method: 'PUT',
      })
      return createErrorResponse('Unauthorized', 403, 'UNAUTHORIZED')
    }

    const body = await request.json().catch(() => null)
    const validationResult = setActiveResumeSchema.safeParse(body)

    if (!validationResult.success) {
      await capturePostHogEvent('api_resume_active_validation_error', {
        endpoint: '/api/resume/active',
        method: 'PUT',
        error: validationResult.error.issues[0]?.message,
      }, userId)
      return createErrorResponse(
        validationResult.error.issues[0]?.message || 'Invalid request',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { resumeId } = validationResult.data
    const resume = await resumeService.setActiveResume(resumeId)

    await capturePostHogEvent('api_resume_active_updated', {
      endpoint: '/api/resume/active',
      method: 'PUT',
      resumeId,
      filename: resume.filename,
    }, userId)

    return createSuccessResponse({
      ...resume,
      is_active: resume.isActive,
      uploaded_at: resume.uploadedAt,
    })
  } catch (error) {
    logError('PUT /api/resume/active', error)

    await capturePostHogEvent('api_resume_active_error', {
      endpoint: '/api/resume/active',
      method: 'PUT',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, userId ?? 'anonymous')

    if (error instanceof ResumeOperationError) {
      return createErrorResponse(error.message, error.status, error.code)
    }

    return createErrorResponse('Failed to set active resume', 500, 'UPDATE_ERROR')
  }
}

