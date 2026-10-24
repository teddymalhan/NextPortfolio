"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export function HoverCardContent({
  className,
  align = "start",
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "glimpse-content z-50 w-80 max-w-[calc(100vw-2rem)] origin-[var(--radix-hover-card-content-transform-origin)] rounded-xl border border-border/50 bg-gradient-to-r from-card/95 via-card/90 to-card/95 p-4 text-popover-foreground shadow-xl shadow-blue-500/10 outline-none backdrop-blur-xl dark:border-border/90 dark:from-card/98 dark:via-card/95 dark:to-card/98 dark:shadow-black/30 dark:ring-1 dark:ring-white/10",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}
