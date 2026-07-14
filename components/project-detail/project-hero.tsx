"use client";

import Image from "next/image";
import { useMountedReveal } from "@/components/ui/transition-primitives";
import type { Project } from "@/lib/projects";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const isShown = useMountedReveal();
  const imageFit = project.detailHeroImageFit ?? project.heroImageFit;
  const aspectClass =
    project.detailHeroAspect === "banner"
      ? "aspect-[4/1]"
      : "aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/8]";

  return (
    <section className="mb-16 t-panel-slide" data-open={isShown ? "true" : "false"}>
      {/* Large hero image - Cluely style */}
      <div className="relative -mx-6 lg:-mx-16 xl:-mx-24">
        <div className={`relative ${aspectClass} rounded-2xl overflow-hidden mx-4 lg:mx-8 shadow-2xl shadow-black/10 dark:shadow-black/30`}>
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className={imageFit === "contain" ? "object-contain" : "object-cover"}
            priority
            sizes="100vw"
          />
          {project.slug === "kaeru" && (
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          )}
        </div>
      </div>

    </section>
  );
}
