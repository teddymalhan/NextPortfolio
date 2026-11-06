import { NextRequest, NextResponse, connection } from 'next/server'
import { resumeService } from '@/lib/services/resume-service'
import { parseResumeId } from '@/lib/validations/resume'
import { logError } from '@/lib/api-response'
import { capturePostHogEvent } from '@/lib/posthog-server'

export async function GET(request: NextRequest) {
  await connection()
  try {
    const isVisible = await resumeService.getResumeVisibility()

    if (!isVisible) {
      await capturePostHogEvent('api_resume_file_not_visible', {
        endpoint: '/api/resume/file',
        method: 'GET',
      })
      return new NextResponse('Resume not available', { status: 404 })
    }

    const activeResume = await resumeService.getActiveResume()

    if (!activeResume) {
      await capturePostHogEvent('api_resume_file_no_active', {
        endpoint: '/api/resume/file',
        method: 'GET',
      })
      return new NextResponse('No active resume found', { status: 404 })
    }

    const versionParam = request.nextUrl.searchParams.get('v')
    if (versionParam !== null) {
      const requestedVersionId = parseResumeId(versionParam)
      if (requestedVersionId !== activeResume.id) {
        await capturePostHogEvent('api_resume_file_invalid_version', {
          endpoint: '/api/resume/file',
          method: 'GET',
          requestedVersion: requestedVersionId,
          activeResumeId: activeResume.id,
        })
        return new NextResponse('Resume not found', { status: 404 })
      }
    }

    if (activeResume.blob_url) {
      try {
        const blobResponse = await fetch(activeResume.blob_url)
        if (blobResponse.ok) {

          await capturePostHogEvent('api_resume_file_downloaded', {
            endpoint: '/api/resume/file',
            method: 'GET',
            resumeId: activeResume.id,
            filename: activeResume.filename,
            fileSize: activeResume.fileSize,
          })

          return new NextResponse(blobResponse.body, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline; filename="Teddy_Malhan_Resume.pdf"',
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          })
        } else {
          await capturePostHogEvent('api_resume_file_blob_fetch_error', {
            endpoint: '/api/resume/file',
            method: 'GET',
            status: blobResponse.status,
          })
          return new NextResponse('Error fetching resume file from storage', { status: 500 })
        }
      } catch (fetchError) {
        logError('GET /api/resume/file - Fetch error', fetchError)
        await capturePostHogEvent('api_resume_file_fetch_error', {
          endpoint: '/api/resume/file',
          method: 'GET',
          error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        })
        return new NextResponse('Error fetching resume file', { status: 500 })
      }
    }

    return new NextResponse('No active resume found', { status: 404 })
  } catch (error) {
    logError('GET /api/resume/file', error)
    await capturePostHogEvent('api_resume_file_error', {
      endpoint: '/api/resume/file',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return new NextResponse('Error fetching resume', { status: 500 })
  }
}

