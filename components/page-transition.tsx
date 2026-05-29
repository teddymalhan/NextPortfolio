"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type Direction = "forward" | "back";

interface PageTransitionContextValue {
  navigateTo: (href: string, direction?: Direction) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigateTo: () => {},
});

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

const DURATION = 220;

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = wrapperRef.current;
    if (!el) return;

    let direction: Direction = "forward";
    try {
      direction =
        (sessionStorage.getItem("pageTransitionDirection") as Direction) ??
        "forward";
    } catch {}

    const enterCls =
      direction === "forward" ? "page-enter-right" : "page-enter-left";
    el.classList.remove(
      "page-enter-right",
      "page-enter-left",
      "page-exit-left",
      "page-exit-right"
    );
    void el.offsetHeight;
    el.classList.add(enterCls);
  }, [pathname]);

  const navigateTo = useCallback(
    (href: string, direction: Direction = "forward") => {
      try {
        sessionStorage.setItem("pageTransitionDirection", direction);
      } catch {}

      const el = wrapperRef.current;
      if (!el) {
        router.push(href);
        return;
      }

      const exitCls =
        direction === "forward" ? "page-exit-left" : "page-exit-right";
      el.classList.remove("page-enter-right", "page-enter-left");
      el.classList.add(exitCls);

      setTimeout(() => router.push(href), DURATION);
    },
    [router]
  );

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      <div ref={wrapperRef}>{children}</div>
    </PageTransitionContext.Provider>
  );
}
