"use client";

// Adapted from Kibo UI Glimpse: https://www.kibo-ui.com/components/glimpse
import Image from "next/image";
import type { ComponentProps } from "react";
import { HoverCard, HoverCardContent } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export function Glimpse(props: ComponentProps<typeof HoverCard>) {
  return <HoverCard openDelay={250} closeDelay={150} {...props} />;
}

interface GlimpsePreviewProps extends Omit<ComponentProps<typeof HoverCardContent>, "children" | "title"> {
  title: string;
  description: string;
  image: { src: string; alt: string };
  titleId?: string;
  descriptionId?: string;
  intent?: boolean;
}

export function GlimpsePreview({
  title,
  description,
  image,
  titleId,
  descriptionId,
  intent = false,
  className,
  ...props
}: GlimpsePreviewProps) {
  return (
    <HoverCardContent className={cn("overflow-hidden p-0", className)} {...props}>
      <Image
        src={image.src}
        alt={image.alt}
        width={600}
        height={260}
        loading={intent ? "eager" : "lazy"}
        fetchPriority={intent ? "high" : undefined}
        decoding="async"
        unoptimized
        className="aspect-[30/13] w-full border-b border-border/50 bg-white object-contain p-3"
      />
      <div className="p-4">
        <p id={titleId} className="text-sm font-semibold tracking-tight">{title}</p>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </HoverCardContent>
  );
}
