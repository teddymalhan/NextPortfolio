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

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) throw new Error("usePageTransition requires PageTransitionProvider");
  return context;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef(pathname);
  const direction = useRef<Direction>("forward");
  const homeScrollPosition = useRef<number | null>(null);
  const pendingPath = useRef<string | null>(null);
  const { playPageEnter, playPageExit } = usePortfolioSounds();

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (pendingPath.current === pathname || (pathname === "/" && homeScrollPosition.current !== null)) {
      window.scrollTo({
        top: pathname === "/" ? homeScrollPosition.current ?? 0 : 0,
        behavior: "instant",
      });
      pendingPath.current = null;
      if (pathname === "/") homeScrollPosition.current = null;
    }

    const element = wrapperRef.current;
    if (!element) return;
    element.classList.remove("page-enter-right", "page-enter-left");
    void element.offsetHeight;
    element.classList.add(direction.current === "forward" ? "page-enter-right" : "page-enter-left");
    direction.current = "forward";
    playPageEnter();
  }, [pathname, playPageEnter]);

  const navigateTo = useCallback(
    (href: string, nextDirection: Direction = "forward") => {
      const targetPath = new URL(href, window.location.href).pathname;
      if (targetPath === pathname) return;
      if (pathname === "/") homeScrollPosition.current = window.scrollY;
      direction.current = nextDirection;
      pendingPath.current = targetPath;
      playPageExit();
      router.push(href, { scroll: false });
    },
    [pathname, router, playPageExit]
  );

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      <div ref={wrapperRef}>{children}</div>
    </PageTransitionContext.Provider>
  );
}
