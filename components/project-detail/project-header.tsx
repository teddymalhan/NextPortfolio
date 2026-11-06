"use client";

import { useMountedReveal } from "@/components/ui/reveal";
import type { Project } from "@/lib/projects";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const isShown = useMountedReveal();

  return (
    <header className={`mb-12 t-stagger ${isShown ? "is-shown" : ""}`}>
      <div className="flex flex-col gap-3">
        <div className="t-stagger-line t-stagger-line--1 flex items-center gap-4 flex-wrap">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            {project.title}
          </h1>
        </div>

        <p className="t-stagger-line t-stagger-line--2 text-lg text-muted-foreground">{project.period}</p>

        {project.tagline && (
          <p className="t-stagger-line t-stagger-line--3 text-xl text-muted-foreground max-w-2xl mt-2">
            {project.tagline}
          </p>
        )}
      </div>
    </header>
  );
}
