"use client"

import { lazy, Suspense, useEffect, useState } from "react"

const Analytics = lazy(() => import("./analytics"))
export default function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const loadAnalytics = () => {
      setShouldLoad(true)
      cleanup()
    }

    const events = ["scroll", "mousemove", "touchstart", "keydown", "click"]
    
    const cleanup = () => {
      events.forEach((event) => {
        window.removeEventListener(event, loadAnalytics, { capture: true })
      })
    }

    events.forEach((event) => {
      window.addEventListener(event, loadAnalytics, { capture: true, once: true, passive: true })
    })

    let idleCallbackId: number | undefined
    let timeoutId: NodeJS.Timeout | undefined

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(loadAnalytics, { timeout: 3000 })
    } else {
      // Fallback for browsers without requestIdleCallback (Safari)
      timeoutId = setTimeout(loadAnalytics, 2000)
    }

    return () => {
      cleanup()
      if (idleCallbackId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId)
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  if (!shouldLoad) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  )
}


