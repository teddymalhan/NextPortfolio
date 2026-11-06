"use client"

import { PostHogProvider, usePostHog } from "posthog-js/react"
import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

function PostHogPageViewInner() {
  const pathname = usePathname()
  const query = useSearchParams()?.toString()
  const posthog = usePostHog()

  useEffect(() => {
    if (!pathname || !posthog) return

    let url = globalThis.window.origin + pathname
    if (query) {
      url = url + `?${query}`
    }

    posthog.capture("$pageview", {
      $current_url: url,
      $referrer: document.referrer,
      $referring_domain: document.referrer ? new URL(document.referrer).hostname : "",
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      device_pixel_ratio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      user_agent: navigator.userAgent,
      connection_type: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || "unknown",
    })

    let maxScrollDepth = 0
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent
      }
    }

    const startTime = Date.now()
    let departed = false
    const finishEngagement = () => {
      if (departed) return
      departed = true
      const timeOnPage = Math.round((Date.now() - startTime) / 1000)
      posthog.capture("page_engagement", {
        pathname,
        time_on_page_seconds: timeOnPage,
        max_scroll_depth_percent: maxScrollDepth,
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("beforeunload", finishEngagement)

    return () => {
      finishEngagement()
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", finishEngagement)
    }
  }, [pathname, query, posthog])

  return null
}

function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  )
}

export function PHProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!posthogKey || !posthogHost) {
    return <>{children}</>
  }

  return (
    <PostHogProvider
      apiKey={posthogKey}
      options={{
        api_host: posthogHost,
        person_profiles: "always",
        capture_pageview: false, // Route views are captured by PostHogPageView.
        capture_pageleave: true,

        autocapture: {
          dom_event_allowlist: ["click", "change", "submit"],
          url_allowlist: [".*"],
          element_allowlist: ["a", "button", "form", "input", "select", "textarea", "label"],
          css_selector_allowlist: ["[ph-autocapture]", "[data-track]", "[class*='btn']", "[class*='button']", "[class*='link']"],
          capture_copied_text: true,
        },

        capture_dead_clicks: true,
        rageclick: true,

        session_recording: {
          recordCrossOriginIframes: true,
          maskAllInputs: false,
          maskTextSelector: "[data-private]",
          collectFonts: true,
        },

        capture_performance: true,

        enable_heatmaps: true,

        disable_session_recording: false,
        persistence: "localStorage+cookie",
        cross_subdomain_cookie: true,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <PostHogPageView />
      {children}
    </PostHogProvider>
  )
}
