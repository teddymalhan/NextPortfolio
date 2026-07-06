"use client";

import { useEffect, useRef, useState, lazy, Suspense, useCallback } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Tooltip, useTabsPill } from "@/components/ui/transition-primitives";
import { useNavigationStore } from "@/stores";
import { cn } from "@/lib/utils";
import { usePortfolioSounds } from "@/components/sound-effects";

// Lazy load heavy components since they're not critical for initial render
const Fireworks = lazy(() => import("react-canvas-confetti/dist/presets/fireworks"));
const CommandPalette = lazy(() => import("@/components/command-palette"));

const navItems = [
  { name: "🏠 home", href: "#home", emoji: "" },
  { name: "💼 my experience", href: "#experience", emoji: "" },
  { name: "🛠️ projects", href: "#projects", emoji: "" },
  { name: "👤 about me", href: "#about", emoji: "" },
];

// Stagger variants — parent drives timing, children inherit
const menuVariants = {
  open: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: 50 },
};

function MobileNavAccordionItem({
  item,
  scrollToSection,
  prefersReducedMotion,
  playTabSwitch,
}: {
  item: { name: string; href: string; emoji: string };
  scrollToSection: (href: string) => void;
  prefersReducedMotion: boolean;
  playTabSwitch: () => void;
}) {
  return (
    <m.div
      variants={prefersReducedMotion ? undefined : itemVariants}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="transform-gpu"
    >
      <button
        onClick={() => {
          playTabSwitch();
          scrollToSection(item.href);
        }}
        className="w-full py-3 px-4 flex items-center group hover:bg-primary/10 hover:text-primary rounded-full transition-colors duration-200"
      >
        <span className="text-sm font-medium tracking-wide text-foreground flex items-center gap-2">
          {item.emoji && <span>{item.emoji}</span>}
          <span>{item.name.replace(/^[^\s]+\s/, "")}</span>
        </span>
      </button>
    </m.div>
  );
}

interface NavProps {
  scrollToSection: (href: string) => void;
  triggerConfetti: () => void;
  prefersReducedMotion: boolean;
  isResumeVisible: boolean;
  playCommand: () => void;
  playEscape: () => void;
  playDrawerOpen: () => void;
  playDrawerClose: () => void;
  playTabSwitch: () => void;
  playConfetti: () => void;
}

function DesktopNavigation({
  scrollToSection,
  triggerConfetti,
  prefersReducedMotion,
  playCommand,
  playTabSwitch,
  playConfetti,
}: NavProps) {
  const activeSection = useNavigationStore((state) => state.activeSection);
  const isVisible = useNavigationStore((state) => state.isVisible);
  const setCommandOpen = useNavigationStore((state) => state.setCommandOpen);
  const tabsRef = useTabsPill(activeSection || navItems[0].href.slice(1));

  return (
    <m.nav
      aria-label="Primary navigation"
      className="hidden lg:block fixed left-0 right-0 z-50"
      initial={prefersReducedMotion ? false : { opacity: 1 }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              opacity: isVisible ? 1 : 0,
              y: isVisible ? 0 : -20,
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: 0.2,
              ease: [0.5, 1, 0.89, 1],
            }
      }
      style={{
        top: "1rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      <div
        className={`bg-gradient-to-r from-card/90 via-card/80 to-card/90 dark:from-card/95 dark:via-card/90 dark:to-card/95 backdrop-blur-xl border border-border/50 dark:border-border/90 px-6 py-3 shadow-lg dark:shadow-2xl dark:shadow-black/30 shadow-blue-500/10 dark:ring-1 dark:ring-white/10 rounded-full max-w-[1152px] mx-auto`}
        style={{
          minHeight: "60px",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                playConfetti();
                triggerConfetti();
              }}
              className="text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer"
              aria-label="Trigger confetti"
            >
              🧸
            </button>

            <div ref={tabsRef} className="t-tabs" aria-label="Sections" role="tablist">
              <span className="t-tabs-pill" aria-hidden="true" />
              {navItems.map((item) => {
                const sectionId = item.href.slice(1);
                const isActive = activeSection === sectionId;

                return (
                  <m.button
                    key={item.name}
                    data-tab-value={sectionId}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      playTabSwitch();
                      scrollToSection(item.href);
                    }}
                    className="t-tab text-sm font-medium"
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to ${item.name}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                  </m.button>
                );
              })}
            </div>
          </div>

          {/* Right side - Search Bar, Auth, and Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playCommand();
                setCommandOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-background border border-border rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors duration-200"
              style={{
                minWidth: "240px",
              }}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Search website...</span>
              <Tooltip label="Open command palette">
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <span className="text-xs">⌘</span>
                  <span className="text-xs">K</span>
                </span>
              </Tooltip>
            </button>

            <AnimatedThemeToggler className="w-9 h-9 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors duration-200" />
          </div>
        </div>
      </div>
    </m.nav>
  );
}

function MobileNav({
  scrollToSection,
  triggerConfetti,
  prefersReducedMotion,
  playDrawerOpen,
  playDrawerClose,
  playTabSwitch,
  playConfetti,
}: NavProps) {
  const isVisible = useNavigationStore((state) => state.isVisible);
  const isMobileMenuOpen = useNavigationStore((state) => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useNavigationStore((state) => state.setIsMobileMenuOpen);

  return (
    <>
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 backdrop-blur-sm bg-background/30 transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => {
          if (isMobileMenuOpen) {
            playDrawerClose();
            setIsMobileMenuOpen(false);
          }
        }}
        aria-hidden="true"
      />
      <div
        className={cn(
          "lg:hidden fixed top-4 left-4 right-4 z-50 transition-[opacity,transform] duration-300 ease-in-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        )}
      >
      <m.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? "auto" : 60 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "overflow-hidden rounded-2xl",
          "bg-card/98 supports-[backdrop-filter]:bg-card/90 supports-[backdrop-filter]:backdrop-blur-md",
          "dark:bg-card supports-[backdrop-filter]:dark:bg-card/95",
          "border border-border dark:border-border/90 shadow-lg dark:shadow-2xl dark:shadow-black/30 shadow-blue-500/10 dark:ring-1 dark:ring-white/10",
          "transform-gpu backface-hidden",
        )}
        onAnimationStart={() => console.log("[MobileNav] animation start", { isMobileMenuOpen })}
        onAnimationComplete={() => console.log("[MobileNav] animation complete", { isMobileMenuOpen })}
      >
        <div className="h-[60px] flex items-center justify-between px-4 shrink-0">
          <button
            onClick={() => {
              playConfetti();
              triggerConfetti();
            }}
            className="text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer"
            aria-label="Trigger confetti"
          >
            🧸
          </button>

          <div className="flex items-center gap-2">
            <AnimatedThemeToggler className="w-9 h-9 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors duration-200" />
            <button
              onClick={() => {
                if (isMobileMenuOpen) {
                  playDrawerClose();
                } else {
                  playDrawerOpen();
                }
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="h-10 w-10 flex flex-col items-center justify-center gap-[6px] rounded-full hover:bg-secondary/50 transition-colors duration-200 cursor-pointer"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={cn(
                  "block w-[22px] h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center",
                  isMobileMenuOpen ? "translate-y-[4px] rotate-45" : ""
                )}
              />
              <span
                className={cn(
                  "block w-[22px] h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center",
                  isMobileMenuOpen ? "-translate-y-[4px] -rotate-45" : ""
                )}
              />
            </button>
          </div>
        </div>

        <m.nav
          aria-label="Mobile navigation"
          aria-hidden={!isMobileMenuOpen}
          variants={prefersReducedMotion ? undefined : menuVariants}
          animate={isMobileMenuOpen ? "open" : "closed"}
          className="px-4 pb-4 space-y-1"
        >
          {navItems.map((item) => (
            <MobileNavAccordionItem
              key={item.name}
              item={item}
              scrollToSection={scrollToSection}
              prefersReducedMotion={prefersReducedMotion}
              playTabSwitch={playTabSwitch}
            />
          ))}
        </m.nav>
      </m.div>
    </div>
    </>
  );
}

export function Navigation({ isResumeVisible }: { isResumeVisible: boolean }) {
  const {
    handleScroll: handleScrollAction,
    setIsMobileMenuOpen,
    updateCanvasDimensions,
    fetchResumePath,
    toggleCommand,
    handleEscape,
  } = useNavigationStore();

  const commandOpen = useNavigationStore((state) => state.commandOpen);
  const resumePath = useNavigationStore((state) => state.resumePath);
  const canvasDimensions = useNavigationStore((state) => state.canvasDimensions);

  const conductorRef = useRef<any>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  const {
    playCommand,
    playEscape,
    playDrawerOpen,
    playDrawerClose,
    playTabSwitch,
    playConfetti,
  } = usePortfolioSounds();

  useEffect(() => {
    const handleScroll = () => {
      handleScrollAction(!!prefersReducedMotion, navItems);
    };

    globalThis.window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      globalThis.window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScrollAction, prefersReducedMotion]);

  useEffect(() => {
    setIsMounted(true);
    updateCanvasDimensions();
    globalThis.window.addEventListener("resize", updateCanvasDimensions);
    globalThis.window.addEventListener("orientationchange", updateCanvasDimensions);
    return () => {
      globalThis.window.removeEventListener("resize", updateCanvasDimensions);
      globalThis.window.removeEventListener("orientationchange", updateCanvasDimensions);
    };
  }, [updateCanvasDimensions]);

  useEffect(() => {
    fetchResumePath(isResumeVisible);
  }, [isResumeVisible, fetchResumePath]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const isCommandOpen = useNavigationStore.getState().commandOpen;
        if (isCommandOpen) {
          playEscape();
        } else {
          playCommand();
        }
        toggleCommand();
      } else if (e.key === "Escape") {
        const { commandOpen, isMobileMenuOpen } = useNavigationStore.getState();
        if (commandOpen || isMobileMenuOpen) {
          playEscape();
        }
        handleEscape();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCommand, handleEscape, playCommand, playEscape]);

  const scrollToSection = useCallback((href: string) => {
    const sectionId = href.slice(1);
    const element = document.getElementById(sectionId);
    if (!element) {
      setIsMobileMenuOpen(false);
      return;
    }

    useNavigationStore.getState().setIsVisible(true);
    const offset = sectionId === "experience" ? 40 : 20;
    const isMobileMenuOpen = useNavigationStore.getState().isMobileMenuOpen;

    const doScroll = () => {
      const targetPosition =
        element.getBoundingClientRect().top +
        globalThis.window.pageYOffset -
        offset;
      globalThis.window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    };

    if (isMobileMenuOpen) {
      // Wait for mobile menu closing animation (400ms) to finish —
      // layout shifts during the height animation cancel smooth scrollTo calls.
      setIsMobileMenuOpen(false);
      setTimeout(doScroll, 450);
    } else {
      doScroll();
    }
  }, [prefersReducedMotion, setIsMobileMenuOpen]);

  const triggerConfetti = () => {
    if (conductorRef.current) {
      conductorRef.current.run({ speed: 3, duration: 1000 });
    }
  };

  const handleConfettiInit = ({ conductor }: { conductor: any }) => {
    conductorRef.current = conductor;
  };

  const navProps: NavProps = {
    scrollToSection,
    triggerConfetti,
    prefersReducedMotion: !!prefersReducedMotion,
    isResumeVisible,
    playCommand,
    playEscape,
    playDrawerOpen,
    playDrawerClose,
    playTabSwitch,
    playConfetti,
  };

  return (
    <>
      <DesktopNavigation {...navProps} />
      <MobileNav {...navProps} />

      {/* Command Dialog - Lazy loaded */}
      {commandOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            open={commandOpen}
            onOpenChange={(open: boolean) => useNavigationStore.getState().setCommandOpen(open)}
            isResumeVisible={isResumeVisible}
            resumePath={resumePath}
            scrollToSection={scrollToSection}
            triggerConfetti={triggerConfetti}
          />
        </Suspense>
      )}

      {/* Confetti Component - Lazy loaded */}
      {isMounted && (
        <Suspense fallback={null}>
          <Fireworks
            onInit={handleConfettiInit}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            style={{
              position: "fixed",
              pointerEvents: "none",
              top: 0,
              left: 0,
              zIndex: 9999,
            }}
          />
        </Suspense>
      )}
    </>
  );
}
