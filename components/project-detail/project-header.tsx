"use client";

import { Trophy } from "lucide-react";
import { useMountedReveal } from "@/components/ui/transition-primitives";
import { Badge } from "@/components/ui/badge";
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
          {project.award && (
            <Badge className="bg-foreground text-background dark:bg-background dark:text-foreground font-medium px-3 py-1.5 rounded-full border-0 text-sm flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              {project.award}
            </Badge>
          )}
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
