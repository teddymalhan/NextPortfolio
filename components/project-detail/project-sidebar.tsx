"use client";

import { m, useReducedMotion } from "framer-motion";
import { ExternalLink, Github, Youtube, FileText, Play } from "lucide-react";
import type { Project, ProjectLink } from "@/lib/projects";
import { usePortfolioSounds } from "@/components/sound-effects";

const iconMap = {
  ExternalLink,
  Github,
  Youtube,
  FileText,
  Play,
};

interface ProjectSidebarProps {
  project: Project;
}

function LinkItem({ link }: { link: ProjectLink }) {
  const Icon = iconMap[link.icon];
  const { playClick } = usePortfolioSounds();
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={playClick}
      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group"
    >
      <span>{link.label}</span>
      <Icon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  );
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.aside
      initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-8"
    >
      {/* Timeline */}
      {project.timeline.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Timeline
          </h3>
          <div className="space-y-2">
            {project.timeline.map((entry) => (
              <div key={entry.date} className="text-muted-foreground">
                <span className="font-medium text-foreground">{entry.date}</span>
                {entry.event && <span className="ml-2">- {entry.event}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      {project.tools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Tools</h3>
          <div className="flex flex-col gap-1.5">
            {project.tools.map((tool) => (
              <span key={tool} className="text-sm text-muted-foreground">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {project.links.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Links</h3>
          <div className="space-y-3">
            {project.links.map((link) => (
              <LinkItem key={link.href} link={link} />
            ))}
          </div>
        </div>
      )}
    </m.aside>
  );
}
