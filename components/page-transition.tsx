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
import { usePortfolioSounds } from "@/components/sound-effects";

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


function transitionPathname(href: string) {
  try {
    return new URL(href, "http://local").pathname;
  } catch {
    return href.split(/[?#]/, 1)[0] || "/";
  }
}
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const { playPageEnter, playPageExit } = usePortfolioSounds();

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
    playPageEnter();
  }, [pathname, playPageEnter]);


  const navigateTo = useCallback(
    (href: string, direction: Direction = "forward") => {
      const targetPath = transitionPathname(href);
      if (targetPath === pathname) {
        return;
      }
      playPageExit();

      try {
        sessionStorage.setItem("pageTransitionDirection", direction);
      } catch {}

      router.push(href);
    },
    [pathname, router, playPageExit]
  );

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      <div ref={wrapperRef}>{children}</div>
    </PageTransitionContext.Provider>
  );
}
