"use client";

import { useEffect, useState } from "react";
import { readCssDuration } from "@/lib/css-duration";

export function useMountedReveal() {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return isShown;
}

export function useClosingTransition(isOpen: boolean) {
  const [isPresent, setIsPresent] = useState(isOpen);
  if (isOpen && !isPresent) setIsPresent(true);

  useEffect(() => {
    if (isOpen || !isPresent) return;
    const closeMs = readCssDuration("--dropdown-close-dur", 150);
    const timeout = window.setTimeout(() => setIsPresent(false), closeMs);
    return () => window.clearTimeout(timeout);
  }, [isOpen, isPresent]);

  return !isOpen && isPresent;
}
