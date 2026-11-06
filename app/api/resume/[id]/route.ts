import { NextRequest, connection } from 'next/server'
import { getAdminUserId } from '@/lib/auth'
import { resumeService, ResumeOperationError } from '@/lib/services/resume-service'
import { createErrorResponse, createSuccessResponse, logError } from '@/lib/api-response'
import { parseResumeId, resumeUpdateSchema } from '@/lib/validations/resume'
import { capturePostHogEvent } from '@/lib/posthog-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection()
  let userId: string | null = null
  try {
    userId = await getAdminUserId()
    if (!userId) {
      await capturePostHogEvent('api_resume_update_unauthorized', { endpoint: '/api/resume/[id]', method: 'PUT' })
      return createErrorResponse('Unauthorized', 403, 'UNAUTHORIZED')
    }
    const { id } = await params
    const resumeId = parseResumeId(id)
    if (resumeId === null) {
      await capturePostHogEvent('api_resume_update_invalid_id', { endpoint: '/api/resume/[id]', method: 'PUT', id }, userId)
      return createErrorResponse('Invalid resume ID', 400, 'INVALID_RESUME_ID')
    }
    const validation = resumeUpdateSchema.safeParse(await request.json().catch(() => null))
    if (!validation.success) {
      const error = validation.error.issues[0]?.message || 'Invalid request'
      await capturePostHogEvent('api_resume_update_validation_error', { endpoint: '/api/resume/[id]', method: 'PUT', resumeId, error }, userId)
      return createErrorResponse(error, 400, 'VALIDATION_ERROR')
    }
    const resume = await resumeService.updateResume(resumeId, validation.data)
    await capturePostHogEvent('api_resume_updated', {
      endpoint: '/api/resume/[id]', method: 'PUT', resumeId, filename: resume.filename, hasNotes: !!resume.notes,
    }, userId)
    return createSuccessResponse(resume)
  } catch (error) {
    logError('PUT /api/resume/[id]', error)
    await capturePostHogEvent('api_resume_update_error', {
      endpoint: '/api/resume/[id]', method: 'PUT', error: error instanceof Error ? error.message : 'Unknown error',
    }, userId ?? 'anonymous')
    if (error instanceof ResumeOperationError) return createErrorResponse(error.message, error.status, error.code)
    return createErrorResponse('Failed to update resume', 500, 'UPDATE_ERROR')
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection()
  let userId: string | null = null
  try {
    userId = await getAdminUserId()
    if (!userId) {
      await capturePostHogEvent('api_resume_delete_unauthorized', { endpoint: '/api/resume/[id]', method: 'DELETE' })
      return createErrorResponse('Unauthorized', 403, 'UNAUTHORIZED')
    }
    const { id } = await params
    const resumeId = parseResumeId(id)
    if (resumeId === null) {
      await capturePostHogEvent('api_resume_delete_invalid_id', { endpoint: '/api/resume/[id]', method: 'DELETE', id }, userId)
      return createErrorResponse('Invalid resume ID', 400, 'INVALID_RESUME_ID')
    }
    const result = await resumeService.deleteResume(resumeId)
    await capturePostHogEvent('api_resume_deleted', {
      endpoint: '/api/resume/[id]', method: 'DELETE', resumeId,
      filename: result.resume.filename, fileSize: result.resume.fileSize,
    }, userId)
    return createSuccessResponse(result)
  } catch (error) {
    logError('DELETE /api/resume/[id]', error)
    const event = error instanceof ResumeOperationError && error.code === 'CANNOT_DELETE_ACTIVE'
      ? 'api_resume_delete_active_blocked'
      : error instanceof ResumeOperationError && error.code === 'RESUME_NOT_FOUND'
        ? 'api_resume_delete_not_found'
        : 'api_resume_delete_error'
    await capturePostHogEvent(event, {
      endpoint: '/api/resume/[id]', method: 'DELETE', error: error instanceof Error ? error.message : 'Unknown error',
    }, userId ?? 'anonymous')
    if (error instanceof ResumeOperationError) return createErrorResponse(error.message, error.status, error.code)
    return createErrorResponse('Failed to delete resume', 500, 'DELETE_ERROR')
  }
}
