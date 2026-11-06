import { connection } from 'next/server'
import { getAdminUserId } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse, logError } from '@/lib/api-response'
import { capturePostHogEvent } from '@/lib/posthog-server'

export async function GET() {
  await connection()
  try {
    const userId = await getAdminUserId()
    const authorized = userId !== null

    await capturePostHogEvent('api_auth_check_admin', {
      endpoint: '/api/auth/check-admin',
      method: 'GET',
      authorized,
    }, userId ?? 'anonymous')

    return createSuccessResponse({ authorized })
  } catch (error) {
    logError('GET /api/auth/check-admin', error)
    await capturePostHogEvent('api_auth_check_admin_error', {
      endpoint: '/api/auth/check-admin',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return createErrorResponse('Error checking authorization', 500, 'AUTH_CHECK_ERROR')
  }
}
