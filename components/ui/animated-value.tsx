"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { readCssDuration } from "@/lib/css-duration";

type AnimatedTextProps = {
  value: string;
  className?: string;
};

export function AnimatedText({ value, className }: AnimatedTextProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const elementRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    element.classList.remove("is-exit", "is-enter-start");
    if (valueRef.current === value) return;

    let frame: number | undefined;
    const duration = readCssDuration("--text-swap-dur", 150);
    element.classList.add("is-exit");
    const timeout = window.setTimeout(() => {
      valueRef.current = value;
      setDisplayValue(value);
      element.classList.remove("is-exit");
      element.classList.add("is-enter-start");
      frame = requestAnimationFrame(() => element.classList.remove("is-enter-start"));
    }, duration);

    return () => {
      window.clearTimeout(timeout);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={elementRef} className={cn("t-text-swap", className)}>{displayValue}</span>;
}

type AnimatedNumberProps = {
  value: string;
  className?: string;
};

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const groupRef = useRef<HTMLSpanElement>(null);
  const chars = useMemo(() => Array.from(value), [value]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.classList.remove("is-animating");
    void group.offsetHeight;
    group.classList.add("is-animating");
  }, [value]);

  return (
    <span ref={groupRef} className={cn("t-digit-group is-animating", className)} aria-label={value}>
      {chars.map((char, index) => {
        const stagger = index === chars.length - 2 ? "1" : index === chars.length - 1 ? "2" : undefined;

        return (
          <span key={`${char}-${index}`} className="t-digit" data-stagger={stagger} aria-hidden="true">
            {char}
          </span>
        );
      })}
    </span>
  );
}
