"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";
import { getBentoProjects } from "@/lib/projects";
import { usePageTransition } from "@/components/page-transition";

export function ProjectsBento() {
  const projects = getBentoProjects();
  const prefersReducedMotion = useReducedMotion();
  const { navigateTo } = usePageTransition();

  return (
    <m.section
      id="projects"
      className="min-h-screen pt-22 pb-8 will-change-[transform,opacity]"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-5xl font-bold tracking-tight text-left text-foreground">
            Projects
          </h2>
        </div>

        <BentoGrid>
          {projects.map((project) => {
            const tags = project.technologies.slice(0, 3);
            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="contents"
                onClick={(e) => {
                  e.preventDefault();
                  try {
                    sessionStorage.setItem("homeScrollPosition", window.pageYOffset.toString());
                  } catch {}
                  navigateTo(`/projects/${project.slug}`, "forward");
                }}
              >
                <BentoCard
                  name={project.name}
                  className={cn(
                    "bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer",
                    project.gridClassName
                  )}
                  background={
                    <div className="relative h-[60%] w-full overflow-hidden rounded-t-2xl bg-muted">
                      <Image
                        src={project.heroImage}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`${project.heroImageFit === "contain" ? "object-contain p-6" : "object-cover"} transition-transform duration-500 group-hover:scale-[1.03]`}
                        quality={90}
                        loading="lazy"
                        decoding="async"
                      />
                      {project.slug === "kaeru" && (
                        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                      )}
                    </div>
                  }
                >
                  <div className="flex flex-1 flex-col bg-white dark:bg-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="rounded-full px-3 py-1 text-xs font-normal bg-muted text-muted-foreground border-0"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </BentoCard>
              </Link>
            );
          })}
        </BentoGrid>
      </div>
    </m.section>
  );
}
