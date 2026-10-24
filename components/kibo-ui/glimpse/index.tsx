"use client";

// Adapted from Kibo UI Glimpse: https://www.kibo-ui.com/components/glimpse
import Image from "next/image";
import type { ComponentProps } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export function Glimpse(props: ComponentProps<typeof HoverCard>) {
  return <HoverCard openDelay={250} closeDelay={150} {...props} />;
}

export function GlimpseTrigger(props: ComponentProps<typeof HoverCardTrigger>) {
  return <HoverCardTrigger {...props} />;
}

export function GlimpseContent(props: ComponentProps<typeof HoverCardContent>) {
  return <HoverCardContent {...props} />;
}

export function GlimpseTitle({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm font-semibold tracking-tight", className)} {...props} />
  );
}

export function GlimpseDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

export function GlimpseImage({ className, alt, ...props }: ComponentProps<typeof Image>) {
  return (
    <Image
      alt={alt}
      width={600}
      height={260}
      loading="lazy"
      decoding="async"
      unoptimized
      className={cn("aspect-[30/13] w-full border-b border-border/50 bg-white object-contain p-3", className)}
      {...props}
    />
  );
}
