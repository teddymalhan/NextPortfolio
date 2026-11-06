"use client"

import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { AnimatedBackground } from "@/components/animated-background"
import { Experience } from "@/components/experience"
import { ProjectsBento } from "@/components/projects-bento"
import { About } from "@/components/about"
import Footer from "@/components/footer"
import type { ProjectCard } from "@/lib/projects"

interface HomeClientProps {
  isResumeVisible: boolean
  resumePath: string | null
  projectCards: ProjectCard[]
}

export function HomeClient({ isResumeVisible, resumePath, projectCards }: HomeClientProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted to-background relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navigation isResumeVisible={isResumeVisible} resumePath={resumePath} />
        <main>
          <Hero isResumeVisible={isResumeVisible} resumePath={resumePath} />
          <div className="h-32 bg-gradient-to-b from-transparent to-background -mt-32 relative z-0" />
          <div className="relative bg-background">
            <div className="lazy-section"><Experience /></div>
            <div className="lazy-section"><ProjectsBento projectCards={projectCards} /></div>
            <div className="lazy-section"><About /></div>
            <Footer isResumeVisible={isResumeVisible} resumePath={resumePath} />
          </div>
        </main>
      </div>
    </div>
  )
}
