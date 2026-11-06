"use client";

import { cloneElement, type ReactElement, useId } from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  label: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  className?: string;
};

export function Tooltip({ label, children, className }: TooltipProps) {
  const id = useId();
  const description = [children.props["aria-describedby"], id].filter(Boolean).join(" ");

  return (
    <span className={cn("t-tt-wrap", className)}>
      <span className="t-tt-trigger">
        {cloneElement(children, { "aria-describedby": description })}
      </span>
      <span id={id} className="t-tt text-xs font-medium" role="tooltip">
        {label}
      </span>
    </span>
  );
}
