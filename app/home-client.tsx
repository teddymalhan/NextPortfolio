"use client"

import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { AnimatedBackground } from "@/components/animated-background"
import { lazy, Suspense, useLayoutEffect, useState } from "react"

const Experience = lazy(() => import("@/components/experience").then(mod => ({ default: mod.Experience })))
const ProjectsBento = lazy(() => import("@/components/projects-bento").then(mod => ({ default: mod.ProjectsBento })))
const About = lazy(() => import("@/components/about").then(mod => ({ default: mod.About })))
const Footer = lazy(() => import("@/components/footer").then(mod => ({ default: mod.default })))

interface HomeClientProps {
  isResumeVisible: boolean
  resumePath: string | null
}

export function HomeClient({ isResumeVisible, resumePath }: HomeClientProps) {
  const [isReady, setIsReady] = useState(false)
  useLayoutEffect(() => {
    try {
      const saved = sessionStorage.getItem("homeScrollPosition")
      if (saved) {
        sessionStorage.removeItem("homeScrollPosition")
        window.scrollTo(0, parseInt(saved, 10))
      }
    } catch {
      // ignore sessionStorage errors
    }
    setIsReady(true)
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted to-background relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        <Navigation isResumeVisible={isResumeVisible} resumePath={resumePath} />
        <main>
          <Hero isResumeVisible={isResumeVisible} resumePath={resumePath} />
          <div className="h-32 bg-gradient-to-b from-transparent to-background -mt-32 relative z-0" />
          <div className="relative bg-background">
            <div className="lazy-section">
              <Suspense fallback={<div id="experience" className="min-h-screen" />}>
                <Experience />
              </Suspense>
            </div>
            <div className="lazy-section">
              <Suspense fallback={<div id="projects" className="min-h-screen" />}>
                <ProjectsBento />
              </Suspense>
            </div>
            <div className="lazy-section">
              <Suspense fallback={<div id="about" className="py-24" />}>
                <About />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <Footer isResumeVisible={isResumeVisible} resumePath={resumePath} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
