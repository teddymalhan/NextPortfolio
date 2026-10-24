"use client";

import { useId, useState } from "react";
import {
  Glimpse,
  GlimpseContent,
  GlimpseDescription,
  GlimpseImage,
  GlimpseTitle,
  GlimpseTrigger,
} from "@/components/kibo-ui/glimpse";
import type { TechnicalTerm as TechnicalTermDefinition } from "@/lib/technical-terms";

export function TechnicalTerm({
  children,
  term,
}: {
  children: string;
  term: TechnicalTermDefinition;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <Glimpse open={open} onOpenChange={setOpen}>
      <GlimpseTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          aria-describedby={open ? `${id}-description` : undefined}
          onClick={() => setOpen(true)}
          onTouchStart={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
          className="cursor-pointer rounded-sm text-inherit underline decoration-primary/50 decoration-dotted underline-offset-4 transition-colors duration-150 hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          {children}
        </button>
      </GlimpseTrigger>
      <GlimpseContent
        id={id}
        role="tooltip"
        aria-labelledby={`${id}-title`}
        className="overflow-hidden p-0"
      >
        <GlimpseImage src={term.image.src} alt={term.image.alt} />
        <div className="p-4">
          <GlimpseTitle id={`${id}-title`}>{term.title}</GlimpseTitle>
          <GlimpseDescription id={`${id}-description`} className="mt-2">
            {term.description}
          </GlimpseDescription>
        </div>
      </GlimpseContent>
    </Glimpse>
  );
}
