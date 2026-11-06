"use client";

import { ArrowLeft } from "lucide-react";
import type { Project } from "@/lib/projects";
import { ProjectHeader } from "./project-header";
import { ProjectHero } from "./project-hero";
import { ProjectSidebar } from "./project-sidebar";
import { ContentSection } from "./content-section";
import { TableOfContents } from "./table-of-contents";
import { usePageTransition } from "@/components/page-transition";
import { TermImagePreloader } from "./term-image-preloader";

interface ProjectDetailPageProps {
  project: Project;
}

export function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  const { navigateTo } = usePageTransition();

  const handleBackClick = () => {
    navigateTo("/", "back");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-12 lg:pb-24">
        <ProjectHeader project={project} />

        <ProjectHero project={project} />

        <TableOfContents sections={project.sections}>
          <TermImagePreloader sources={project.termImageSources}>
            <main>
              {project.sections.map((section, i) => (
                <ContentSection key={section.id} section={section} index={i} />
              ))}
            </main>
          </TermImagePreloader>
          <ProjectSidebar project={project} />
        </TableOfContents>
      </div>
    </div>
  );
}
