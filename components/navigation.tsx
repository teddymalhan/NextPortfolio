"use client";

import { useEffect, useRef, useState, lazy, Suspense, useCallback } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Tooltip } from "@/components/ui/tooltip";
import { useTabsPill } from "@/components/ui/tabs-pill";
import { cn } from "@/lib/utils";
import { usePortfolioSounds } from "@/components/sound-effects";
import { getActiveSection, navigationSections, scrollToSection, type SectionId } from "./navigation-sections";
import type { TConductorInstance } from "react-canvas-confetti/dist/types";

const Fireworks = lazy(() => import("react-canvas-confetti/dist/presets/fireworks"));
const CommandPalette = lazy(() => import("@/components/command-palette"));

const menuVariants = {
  open: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};
const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: 50 },
};

interface NavigationActions {
  onSection: (id: SectionId) => void;
  onConfetti: () => void;
  reducedMotion: boolean;
}

function DesktopNavigation({
  onSection, onConfetti, reducedMotion, activeSection, onSearch,
}: NavigationActions & { activeSection: SectionId; onSearch: () => void }) {
  const tabsRef = useTabsPill(activeSection);
  return (
    <m.nav
      aria-label="Primary navigation"
      className="hidden lg:block fixed left-0 right-0 z-50"
      initial={reducedMotion ? false : { opacity: 1 }}
      style={{ top: "1rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
    >
      <div
        className="bg-gradient-to-r from-card/90 via-card/80 to-card/90 dark:from-card/95 dark:via-card/90 dark:to-card/95 backdrop-blur-xl border border-border/50 dark:border-border/90 px-6 py-3 shadow-lg dark:shadow-2xl dark:shadow-black/30 shadow-blue-500/10 dark:ring-1 dark:ring-white/10 rounded-full max-w-[1152px] mx-auto"
        style={{ minHeight: "60px" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onConfetti} className="text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer" aria-label="Trigger confetti">🧸</button>
            <div ref={tabsRef} className="t-tabs" aria-label="Sections" role="tablist">
              <span className="t-tabs-pill" aria-hidden="true" />
              {navigationSections.map((section) => (
                <m.button
                  key={section.id}
                  data-tab-value={section.id}
                  role="tab"
                  aria-selected={activeSection === section.id}
                  onClick={() => onSection(section.id)}
                  className="t-tab text-sm font-medium"
                  aria-current={activeSection === section.id ? "page" : undefined}
                  aria-label={`Go to ${section.emoji} ${section.label}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {section.emoji} {section.label}
                </m.button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip label="Open command palette">
              <button
                onClick={onSearch}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-background border border-border rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors duration-200"
                style={{ minWidth: "240px" }}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">Search website...</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60"><span>⌘</span><span>K</span></span>
              </button>
            </Tooltip>
            <AnimatedThemeToggler className="w-9 h-9 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors duration-200" />
          </div>
        </div>
      </div>
    </m.nav>
  );
}

function MobileNavigation({
  onSection, onConfetti, reducedMotion, open, onOpenChange,
}: NavigationActions & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <>
      <div
        className={cn("lg:hidden fixed inset-0 z-40 bg-background/40 transition-opacity duration-200", open ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="lg:hidden fixed top-4 left-4 right-4 z-50">
        <m.div
          initial={false}
          animate={{ height: open ? "auto" : 60 }}
          transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden rounded-2xl bg-card/95 dark:bg-card/95 border border-border dark:border-border/90 shadow-lg dark:shadow-xl dark:shadow-black/25 shadow-blue-500/10 transform-gpu backface-hidden"
        >
          <div className="h-[60px] flex items-center justify-between px-4 shrink-0">
            <button onClick={onConfetti} className="text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer" aria-label="Trigger confetti">🧸</button>
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler className="w-9 h-9 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors duration-200" />
              <button
                onClick={() => onOpenChange(!open)}
                className="h-10 w-10 flex flex-col items-center justify-center gap-[6px] rounded-full hover:bg-secondary/50 transition-colors duration-200 cursor-pointer"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-navigation"
              >
                <span className={cn("block w-[22px] h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center", open ? "translate-y-[4px] rotate-45" : "")} />
                <span className={cn("block w-[22px] h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center", open ? "-translate-y-[4px] -rotate-45" : "")} />
              </button>
            </div>
          </div>
          <m.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            aria-hidden={!open}
            inert={!open}
            variants={reducedMotion ? undefined : menuVariants}
            animate={open ? "open" : "closed"}
            className="px-4 pb-4 space-y-1"
          >
            {navigationSections.map((section) => (
              <m.div key={section.id} variants={reducedMotion ? undefined : itemVariants} transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} className="transform-gpu">
                <button onClick={() => onSection(section.id)} className="w-full py-3 px-4 flex items-center group hover:bg-primary/10 hover:text-primary rounded-full transition-colors duration-200">
                  <span className="text-sm font-medium tracking-wide text-foreground">{section.label}</span>
                </button>
              </m.div>
            ))}
          </m.nav>
        </m.div>
      </div>
    </>
  );
}

export function Navigation({ isResumeVisible, resumePath }: { isResumeVisible: boolean; resumePath: string | null }) {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [shouldRenderConfetti, setShouldRenderConfetti] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  const conductorRef = useRef<TConductorInstance | null>(null);
  const pendingConfettiRef = useRef(false);
  const reducedMotion = !!useReducedMotion();
  const { playCommand, playEscape, playDrawerOpen, playDrawerClose, playTabSwitch, playConfetti } = usePortfolioSounds();

  useEffect(() => {
    const updateSection = () => {
      const section = getActiveSection();
      if (section) setActiveSection(section);
    };
    window.addEventListener("scroll", updateSection, { passive: true });
    window.addEventListener("resize", updateSection);
    updateSection();
    return () => {
      window.removeEventListener("scroll", updateSection);
      window.removeEventListener("resize", updateSection);
    };
  }, []);

  useEffect(() => {
    if (!shouldRenderConfetti) return;
    const updateDimensions = () => setCanvasDimensions({ width: window.innerWidth, height: window.innerHeight });
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, [shouldRenderConfetti]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (commandOpen) playEscape(); else playCommand();
        setCommandOpen(!commandOpen);
      } else if (event.key === "Escape") {
        if (commandOpen || mobileOpen) playEscape();
        setCommandOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [commandOpen, mobileOpen, playCommand, playEscape]);

  const onSection = useCallback((id: SectionId) => {
    playTabSwitch();
    setMobileOpen(false);
    scrollToSection(id);
  }, [playTabSwitch]);

  const triggerConfetti = () => {
    pendingConfettiRef.current = true;
    if (conductorRef.current) {
      conductorRef.current.run({ speed: 3, duration: 1000 });
      pendingConfettiRef.current = false;
    } else {
      setShouldRenderConfetti(true);
    }
  };

  const onConfetti = () => { playConfetti(); triggerConfetti(); };
  const onMobileOpenChange = (open: boolean) => {
    if (open) playDrawerOpen(); else playDrawerClose();
    setMobileOpen(open);
  };

  return (
    <>
      <DesktopNavigation onSection={onSection} onConfetti={onConfetti} reducedMotion={reducedMotion} activeSection={activeSection} onSearch={() => { playCommand(); setCommandOpen(true); }} />
      <MobileNavigation onSection={onSection} onConfetti={onConfetti} reducedMotion={reducedMotion} open={mobileOpen} onOpenChange={onMobileOpenChange} />
      {commandOpen && (
        <Suspense fallback={null}>
          <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} isResumeVisible={isResumeVisible} resumePath={resumePath} scrollToSection={(id) => { setMobileOpen(false); scrollToSection(id); }} triggerConfetti={triggerConfetti} />
        </Suspense>
      )}
      {shouldRenderConfetti && (
        <Suspense fallback={null}>
          <Fireworks
            onInit={({ conductor }) => {
              conductorRef.current = conductor;
              if (pendingConfettiRef.current) {
                conductor.run({ speed: 3, duration: 1000 });
                pendingConfettiRef.current = false;
              }
            }}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            style={{ position: "fixed", pointerEvents: "none", top: 0, left: 0, zIndex: 9999 }}
          />
        </Suspense>
      )}
    </>
  );
}
