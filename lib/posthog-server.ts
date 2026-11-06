import { PostHog } from 'posthog-node'

export async function capturePostHogEvent(
  event: string,
  properties?: Record<string, unknown>,
  distinctId: string = 'anonymous',
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  let client: PostHog | undefined
  try {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    })
    client.capture({
      distinctId,
      event,
      properties: { ...properties, timestamp: new Date().toISOString() },
    })
  } catch (error) {
    console.error('Server analytics capture failed:', error)
  } finally {
    if (client) {
      try {
        await client.shutdown()
      } catch (error) {
        console.error('Server analytics flush failed:', error)
      }
    }
  }
}
