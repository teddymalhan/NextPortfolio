"use client"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PHProvider } from "./posthog-provider"

export default function SiteAnalytics() {
  return (
    <PHProvider>
      <Analytics />
      <SpeedInsights />
    </PHProvider>
  )
}
