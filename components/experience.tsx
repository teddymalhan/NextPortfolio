"use client";

import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";
import { Badge } from "./ui/badge";

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  logo: string;
  logoFrameClassName: string;
  logoImageClassName: string;
  tags: { emoji: string; label: string }[];
}

const experiences: ExperienceItem[] = [
  {
    company: "Electronic Arts",
    role: "Software Engineer Intern",
    period: "May 2026 - Present",
    location: "Vancouver, BC",
    tags: [{ emoji: "⎈", label: "PI&E Game Server Hosting" }],
    logo: "/ea-logo-full.jpg",
    logoFrameClassName: "rounded-2xl p-2.5",
    logoImageClassName: "object-cover scale-185",
  },
  {
    company: "Electronic Arts",
    role: "Software Engineer Intern",
    period: "May 2025 - Aug 2025",
    location: "Vancouver, BC",
    tags: [{ emoji: "🕹️", label: "Digital Platform: Arrival" }],
    logo: "/ea-logo-full.jpg",
    logoFrameClassName: "rounded-2xl p-2.5",
    logoImageClassName: "object-cover scale-185",
  },
  {
    company: "Dialpad",
    role: "Software Engineer Intern",
    period: "Jan 2025 - Apr 2025",
    location: "Toronto, ON",
    logo: "/dialpad-logo-full.jpg",
    logoFrameClassName: "rounded-xl",
    logoImageClassName: "object-contain",
    tags: [{ emoji: "💼", label: "Supervisor Team" }],
  },
  {
    company: "SFU Blueprint",
    role: "Software Developer",
    period: "June 2024 - Present",
    location: "Vancouver, BC",
    logo: "https://media.licdn.com/dms/image/v2/D560BAQGUjTCDhAjcFA/company-logo_200_200/company-logo_200_200/0/1690849546053/sfu_blueprint_logo?e=2147483647&v=beta&t=JFlsmyor7g50Tsl22WLuHPB8UODRlSMUKJ91Ek3vOxU",
    logoFrameClassName: "rounded-2xl p-2.5",
    logoImageClassName: "object-cover scale-180",
    tags: [{ emoji: "💻", label: "Blueprint Website" }],
  },
  {
    company: "Develop for Good",
    role: "Engineering Manager",
    period: "Sept 2024 - Feb 2025",
    location: "Remote",
    logo: "/dfg-logo.png",
    logoFrameClassName: "rounded-2xl p-2.5",
    logoImageClassName: "object-cover scale-180",
    tags: [{ emoji: "🐈", label: "Engineering Manager" }],
  },
  {
    company: "Simon Fraser University",
    role: "Computer Science",
    period: "From January 2024",
    location: "Burnaby, BC",
    logo: "/sfu-logo.jpg",
    logoFrameClassName: "rounded-full",
    logoImageClassName: "object-cover",
    tags: [{ emoji: "📚", label: "Education" }],
  },
];

export function Experience() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      id="experience"
      className="min-h-screen will-change-[transform,opacity]"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-20">
        <h1 className="text-5xl font-extrabold tracking-tight text-left text-foreground mb-12">
          Experience
        </h1>

        <div className="space-y-16">
          {experiences.map((experience) => {
            return (
              <div
                key={`${experience.company}-${experience.period}`}
                className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16 pb-16 last:pb-0 group"
              >
                <div className="space-y-0.5">
                  <div className="text-foreground font-semibold text-base tracking-tight">
                    {experience.period}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {experience.location}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">

                    <div className="space-y-2">
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                        {experience.company}
                      </h2>
                      <p className="text-muted-foreground text-lg font-medium">
                        {experience.role}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {experience.tags.map((tag) => (
                        <Badge
                          key={tag.label}
                          variant="outline"
                          className="gap-1.5 px-3 py-2 rounded-full border-border/60 text-foreground/85 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/40 whitespace-normal break-words max-w-[240px] sm:max-w-none"
                        >
                          <span className="text-[15px] leading-none">
                            {tag.emoji}
                          </span>
                          <span className="text-[13.5px] leading-snug font-medium tracking-tight">
                            {tag.label}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <div
                        className={`relative w-16 h-16 flex items-center justify-center overflow-hidden bg-background border border-border/40 shadow-sm
                          ${experience.logoFrameClassName}`}
                      >
                        <div className={`relative w-full h-full`}>
                          <Image
                            src={experience.logo}
                            alt={`${experience.company} logo`}
                            fill
                            className={experience.logoImageClassName}
                            sizes="(min-resolution: 2dppx) 128px, 64px"
                            loading="lazy"
                            decoding="async"
                            quality={90}
                            unoptimized={experience.logo.startsWith("/")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </m.div>
  );
}
