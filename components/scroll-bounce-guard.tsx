"use client"

import { useEffect } from "react"

function getScrollableElement(target: EventTarget | null): HTMLElement {
  let element = target instanceof Element ? target : null

  while (element && element !== document.body) {
    const { overflowY } = window.getComputedStyle(element)
    const canScroll = element.scrollHeight > element.clientHeight

    if (canScroll && (overflowY === "auto" || overflowY === "scroll")) {
      return element as HTMLElement
    }

    element = element.parentElement
  }

  return (document.scrollingElement ?? document.documentElement) as HTMLElement
}

function isPastScrollBoundary(scroller: HTMLElement, deltaY: number) {
  const maxScrollTop = scroller.scrollHeight - scroller.clientHeight

  if (maxScrollTop <= 0) {
    return true
  }

  if (deltaY < 0) {
    return scroller.scrollTop <= 0
  }

  if (deltaY > 0) {
    return scroller.scrollTop >= maxScrollTop - 1
  }

  return false
}

export function ScrollBounceGuard() {
  useEffect(() => {
    let touchStartY = 0

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return
      }

      touchStartY = event.touches[0].clientY
    }

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return
      }

      const touchY = event.touches[0].clientY
      const deltaY = touchStartY - touchY
      const scroller = getScrollableElement(event.target)

      if (isPastScrollBoundary(scroller, deltaY)) {
        event.preventDefault()
      }
    }

    const onWheel = (event: WheelEvent) => {
      const scroller = getScrollableElement(event.target)

      if (isPastScrollBoundary(scroller, event.deltaY)) {
        event.preventDefault()
      }
    }

    const passiveCaptureOptions = { passive: true, capture: true }
    const activeCaptureOptions = { passive: false, capture: true }

    document.addEventListener("touchstart", onTouchStart, passiveCaptureOptions)
    document.addEventListener("touchmove", onTouchMove, activeCaptureOptions)
    document.addEventListener("wheel", onWheel, activeCaptureOptions)

    return () => {
      document.removeEventListener("touchstart", onTouchStart, passiveCaptureOptions)
      document.removeEventListener("touchmove", onTouchMove, activeCaptureOptions)
      document.removeEventListener("wheel", onWheel, activeCaptureOptions)
    }
  }, [])

  return null
}
