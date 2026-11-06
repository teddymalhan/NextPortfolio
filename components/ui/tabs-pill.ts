"use client";

import { useCallback, useEffect, useRef } from "react";

export function useTabsPill(activeValue: string) {
  const rootRef = useRef<HTMLDivElement>(null);

  const moveToActive = useCallback((animate: boolean) => {
    const root = rootRef.current;
    if (!root) return;

    const pill = root.querySelector<HTMLElement>(".t-tabs-pill");
    const tabs = Array.from(root.querySelectorAll<HTMLElement>(".t-tab"));
    const activeTab = tabs.find((tab) => tab.dataset.tabValue === activeValue) ?? tabs[0];
    if (!pill || !activeTab) return;

    if (!animate) {
      const previousTransition = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
      pill.style.width = `${activeTab.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = previousTransition;
      return;
    }

    pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    pill.style.width = `${activeTab.offsetWidth}px`;
  }, [activeValue]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => moveToActive(false));
    const handleResize = () => moveToActive(false);
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [moveToActive]);

  useEffect(() => {
    moveToActive(true);
  }, [moveToActive]);

  return rootRef;
}
