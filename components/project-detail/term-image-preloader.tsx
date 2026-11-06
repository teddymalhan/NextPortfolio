"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";

const TermImageContext = createContext<((src: string) => void) | null>(null);

export function TermImagePreloader({
  sources,
  children,
}: {
  sources: string[];
  children: ReactNode;
}) {
  const prioritizeRef = useRef<(src: string) => void>(() => {});
  const prioritize = useCallback((src: string) => prioritizeRef.current(src), []);

  useEffect(() => {
    const queued = new Set(sources);

    const images = new Map<string, HTMLImageElement>();
    let disposed = false;
    let backgroundStarted = false;
    let backgroundBusy = false;
    let idle: number | undefined;
    let timer: number | undefined;

    function load(src: string, priority: "low" | "high") {
      queued.delete(src);
      const existing = images.get(src);
      if (existing) {
        if (priority === "high") existing.fetchPriority = "high";
        return;
      }

      const image = new Image();
      images.set(src, image);
      image.fetchPriority = priority;
      image.decoding = "async";
      image.onload = image.onerror = () => {
        image.onload = image.onerror = null;
        if (priority === "low") {
          backgroundBusy = false;
          pump();
        }
      };
      image.src = src;
    }

    function pump() {
      if (disposed || !backgroundStarted || backgroundBusy) return;
      const src = queued.values().next().value;
      if (!src) return;
      backgroundBusy = true;
      load(src, "low");
    }

    prioritizeRef.current = (src) => {
      // User intent bypasses the background slot, even on a slow connection.
      load(src, "high");
    };

    function schedule() {
      const start = () => {
        backgroundStarted = true;
        pump();
      };
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        timer = window.setTimeout(start, 0);
      }
    }

    // Speculative downloads must not hold up the page's load event.
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      disposed = true;
      prioritizeRef.current = () => {};
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      for (const image of images.values()) {
        image.onload = image.onerror = null;
        if (!image.complete) image.removeAttribute("src");
      }
    };
  }, [sources]);

  return <TermImageContext.Provider value={prioritize}>{children}</TermImageContext.Provider>;
}

export function usePrioritizeTermImage() {
  const prioritize = useContext(TermImageContext);
  if (!prioritize) throw new Error("Technical terms require TermImagePreloader");
  return prioritize;
}
