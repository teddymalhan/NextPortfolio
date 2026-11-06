"use client";

import { useId, useState } from "react";
import { Glimpse, GlimpsePreview } from "@/components/kibo-ui/glimpse";
import { HoverCardTrigger } from "@/components/ui/hover-card";
import type { TechnicalTerm as TechnicalTermDefinition } from "@/lib/technical-terms";
import { usePrioritizeTermImage } from "./term-image-preloader";

export function TechnicalTerm({
  children,
  term,
}: {
  children: string;
  term: TechnicalTermDefinition;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const prioritizeImage = usePrioritizeTermImage();

  return (
    <Glimpse open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          aria-describedby={open ? `${id}-description` : undefined}
          onPointerEnter={() => prioritizeImage(term.image.src)}
          onFocus={() => prioritizeImage(term.image.src)}
          onClick={() => setOpen(true)}
          onTouchStart={(event) => {
            event.preventDefault();
            prioritizeImage(term.image.src);
            setOpen(true);
          }}
          className="cursor-pointer rounded-sm text-inherit underline decoration-primary/50 decoration-dotted underline-offset-4 transition-colors duration-150 hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          {children}
        </button>
      </HoverCardTrigger>
      <GlimpsePreview
        id={id}
        role="tooltip"
        aria-labelledby={`${id}-title`}
        titleId={`${id}-title`}
        descriptionId={`${id}-description`}
        title={term.title}
        description={term.description}
        image={term.image}
        intent
      />
    </Glimpse>
  );
}
