import { NextRequest, connection } from 'next/server'
import { getAdminUserId } from '@/lib/auth'
import { resumeService, ResumeOperationError } from '@/lib/services/resume-service'
import { createErrorResponse, createSuccessResponse, logError } from '@/lib/api-response'
import { capturePostHogEvent } from '@/lib/posthog-server'

export async function GET() {
  await connection()
  try {
    const resume = await resumeService.getActiveResume()

    if (!resume) {
      await capturePostHogEvent('api_resume_get_no_active', {
        endpoint: '/api/resume',
        method: 'GET',
      })
      return createSuccessResponse({
        id: null,
        filename: null,
        path: null,
        blob_url: null,
        isActive: false,
        uploadedAt: null,
      })
    }

    await capturePostHogEvent('api_resume_get_success', {
      endpoint: '/api/resume',
      method: 'GET',
      resumeId: resume.id,
      filename: resume.filename,
    })

    const response = createSuccessResponse(resume)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    logError('GET /api/resume', error)
    await capturePostHogEvent('api_resume_get_error', {
      endpoint: '/api/resume',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return createErrorResponse('Failed to fetch resume', 500, 'FETCH_ERROR')
  }
}

export async function POST(request: NextRequest) {
  await connection()
  let userId: string | null = null
  try {
    userId = await getAdminUserId()
    if (!userId) {
      await capturePostHogEvent('api_resume_upload_unauthorized', {
        endpoint: '/api/resume',
        method: 'POST',
      })
      return createErrorResponse('Unauthorized', 403, 'UNAUTHORIZED')
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      await capturePostHogEvent('api_resume_upload_invalid_file', {
        endpoint: '/api/resume',
        method: 'POST',
        error: 'No file provided',
      }, userId)
      return createErrorResponse('No file provided', 400, 'INVALID_FILE')
    }
    const resume = await resumeService.uploadResume(file, userId)

    await capturePostHogEvent('api_resume_uploaded', {
      endpoint: '/api/resume',
      method: 'POST',
      resumeId: resume.id,
      filename: resume.filename,
      fileSize: file.size,
      uploadedBy: userId,
    }, userId)

    return createSuccessResponse(resume)
  } catch (error) {
    logError('POST /api/resume', error)
    await capturePostHogEvent(
      error instanceof ResumeOperationError && error.code === 'INVALID_FILE'
        ? 'api_resume_upload_invalid_file'
        : 'api_resume_upload_error', {
      endpoint: '/api/resume',
      method: 'POST',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, userId ?? 'anonymous')
    if (error instanceof ResumeOperationError) {
      return createErrorResponse(error.message, error.status, error.code)
    }
    return createErrorResponse('Failed to upload resume', 500, 'UPLOAD_ERROR')
  }
}

