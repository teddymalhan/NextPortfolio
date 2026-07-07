import { PostHog } from 'posthog-node'
import { auth } from '@clerk/nextjs/server'

let posthogClient: PostHog | null = null

function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1, // Flush events immediately in serverless
      flushInterval: 0,
    })
  }
  return posthogClient
}

export async function capturePostHogEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  const posthog = getPostHogClient()
  const distinctId = await getDistinctId()

  posthog.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
    },
  })

  // Ensure events are sent before serverless function terminates
  await posthog.shutdown()
}

async function getDistinctId(): Promise<string> {
  // Try to get user ID from Clerk
  const { userId } = await auth()
  if (userId) return userId

  // Fallback to anonymous
  return 'anonymous'
}
