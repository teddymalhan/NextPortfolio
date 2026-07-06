"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "@/components/motion/loader";

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
  const pushTimeoutRef = useRef<number | null>(null);
  const loaderTimeoutRef = useRef<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (loaderTimeoutRef.current !== null) {
      window.clearTimeout(loaderTimeoutRef.current);
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

    loaderTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      loaderTimeoutRef.current = null;
    }, DURATION);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (pushTimeoutRef.current !== null) {
        window.clearTimeout(pushTimeoutRef.current);
      }
      if (loaderTimeoutRef.current !== null) {
        window.clearTimeout(loaderTimeoutRef.current);
      }
    };
  }, []);

  const navigateTo = useCallback(
    (href: string, direction: Direction = "forward") => {
      const targetPath = transitionPathname(href);
      if (targetPath === pathname) {
        return;
      }

      const fromProject =
        pathname === "/projects" || pathname.startsWith("/projects/");
      const toProject =
        targetPath === "/projects" || targetPath.startsWith("/projects/");
      const shouldShowLoader =
        (pathname === "/" && toProject) || (fromProject && targetPath === "/");
      if (shouldShowLoader) {
        setIsTransitioning(true);
      }

      try {
        sessionStorage.setItem("pageTransitionDirection", direction);
      } catch {}

      const el = wrapperRef.current;
      if (!el) {
        router.push(href);
        return;
      }

      if (pushTimeoutRef.current !== null) {
        window.clearTimeout(pushTimeoutRef.current);
      }

      const exitCls =
        direction === "forward" ? "page-exit-left" : "page-exit-right";
      el.classList.remove("page-enter-right", "page-enter-left");
      el.classList.add(exitCls);

      pushTimeoutRef.current = window.setTimeout(() => {
        pushTimeoutRef.current = null;
        router.push(href);
      }, DURATION);
    },
    [pathname, router]
  );

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      <div ref={wrapperRef}>{children}</div>
      {isTransitioning && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/85 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader variant="metaballs" size={48} label="Loading" />
        </div>
      )}
    </PageTransitionContext.Provider>
  );
}
