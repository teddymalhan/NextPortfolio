"use client";

import { m, useReducedMotion } from "framer-motion";
import type { PreparedSection } from "@/lib/technical-terms";
import { TechnicalTerm } from "./technical-term";

export function ContentSection({ section, index }: { section: PreparedSection; index: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.section
      id={section.id}
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
        {section.paragraphs.map((paragraph, index) => (
          <p key={index}>
            {paragraph.map((part, i) =>
              typeof part === "string" ? part : (
                <TechnicalTerm key={i} term={part.term}>{part.text}</TechnicalTerm>
              )
            )}
          </p>
        ))}
      </div>
    </m.section>
  );
}
