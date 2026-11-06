"use client";

import { useCallback, useRef } from "react";

export function useAvatarGroup() {
  const groupRef = useRef<HTMLDivElement>(null);

  const setShifts = useCallback((activeIndex: number | null, phase: "in" | "out") => {
    const root = groupRef.current;
    if (!root) return;

    const computed = getComputedStyle(document.documentElement);
    const readNumber = (name: string, fallback: number) => {
      const parsed = parseFloat(computed.getPropertyValue(name));
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const readEase = (name: string, fallback: string) => computed.getPropertyValue(name).trim() || fallback;

    const lift = readNumber("--avatar-lift", -4);
    const falloff = readNumber("--avatar-falloff", 0.45);
    const scale = readNumber("--avatar-scale", 1.05);
    const timing =
      phase === "out"
        ? readEase("--avatar-ease-out", "cubic-bezier(0.34, 3.85, 0.64, 1)")
        : readEase("--avatar-ease-in", "cubic-bezier(0.22, 1, 0.36, 1)");

    root.querySelectorAll<HTMLElement>(".t-avatar").forEach((element, index) => {
      element.style.transitionTimingFunction = timing;
      if (activeIndex === null) {
        element.style.setProperty("--shift", "0px");
        element.style.setProperty("--scale-active", "1");
        return;
      }

      const distance = Math.abs(index - activeIndex);
      element.style.setProperty("--shift", `${(lift * Math.pow(falloff, distance)).toFixed(3)}px`);
      element.style.setProperty("--scale-active", index === activeIndex ? String(scale) : "1");
    });
  }, []);

  return {
    groupRef,
    onGroupMouseLeave: () => setShifts(null, "out"),
    getAvatarProps: (index: number) => ({
      onMouseEnter: () => setShifts(index, "in"),
    }),
  };
}
