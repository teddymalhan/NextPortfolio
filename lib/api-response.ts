import { NextResponse } from 'next/server'
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api'

export function createErrorResponse(
  error: string,
  status: number = 500,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code && { code }),
    },
    { status }
  )
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

export function logError(context: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  console.error(`[${context}]`, {
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  })
}

