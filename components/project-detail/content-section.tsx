"use client";

import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";
import type { ContentSection as ContentSectionType } from "@/lib/projects";
import { explainTechnicalTerms } from "@/lib/technical-terms";
import { TechnicalTerm } from "./technical-term";

interface ContentSectionProps {
  section: ContentSectionType;
  index: number;
}

// Create a slug from section title for IDs
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ContentSection({ section, index }: ContentSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionId = createSlug(section.title);
  const explainedTerms = new Set<string>();

  return (
    <m.section
      id={sectionId}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={prefersReducedMotion ? { duration: 0, delay: 0 } : { duration: 0.5, delay: index * 0.1 }}
      className="mb-12 scroll-mt-8 motion-reduce:opacity-100! motion-reduce:transform-none!"
    >
      <h2 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
        {section.title}
      </h2>

      <div className="space-y-4 text-muted-foreground leading-relaxed">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>
            {explainTechnicalTerms(paragraph, explainedTerms).map((part, i) =>
              typeof part === "string" ? part : (
                <TechnicalTerm key={i} term={part.term}>{part.text}</TechnicalTerm>
              )
            )}
          </p>
        ))}

        {section.bullets && section.bullets.length > 0 && (
          <ul className="list-disc list-inside space-y-2 mt-4 ml-2">
            {section.bullets.map((bullet) => (
              <li key={bullet}>
                {explainTechnicalTerms(bullet, explainedTerms).map((part, i) =>
                  typeof part === "string" ? part : (
                    <TechnicalTerm key={i} term={part.term}>{part.text}</TechnicalTerm>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {section.image && (
        <figure className="mt-6">
          <div className="relative w-full rounded-lg overflow-hidden border border-border">
            <Image
              src={section.image.src}
              alt={section.image.alt}
              width={1200}
              height={675}
              className="w-full h-auto object-contain"
            />
          </div>
          {section.image.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {section.image.caption}
            </figcaption>
          )}
        </figure>
      )}
    </m.section>
  );
}
