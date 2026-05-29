"use client";

import { Suspense, lazy } from "react";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@/lib/projects";
import { ProjectHeader } from "./project-header";
import { ProjectHero } from "./project-hero";
import { ProjectSidebar } from "./project-sidebar";
import { ContentSection } from "./content-section";
import { TableOfContents } from "./table-of-contents";
import { usePageTransition } from "@/components/page-transition";

// Lazy load heavier components
const DemoSection = lazy(() =>
  import("./demo-section").then((m) => ({ default: m.DemoSection }))
);

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
      {/* Back button */}
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

        {/* Demo Video/GIF */}
        {project.demoMedia && (
          <Suspense
            fallback={
              <div className="aspect-video bg-muted rounded-xl animate-pulse my-16" />
            }
          >
            <DemoSection media={project.demoMedia} />
          </Suspense>
        )}

        {/* Table of Contents - Mobile Only */}
        <TableOfContents sections={project.sections} variant="mobile" />

        {/* Main Content with Sidebars */}
        <div className="grid lg:grid-cols-[240px_1fr_280px] gap-8 lg:gap-12">
          {/* Table of Contents - Desktop Only */}
          <TableOfContents sections={project.sections} variant="desktop" />

          {/* Main Content */}
          <main>
            {project.sections.map((section, i) => (
              <ContentSection key={section.title} section={section} index={i} />
            ))}
          </main>

          {/* Project Info Sidebar */}
          <ProjectSidebar project={project} />
        </div>
      </div>
    </div>
  );
}
