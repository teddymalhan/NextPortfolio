"use client";

import { useState, useEffect, useId, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { PreparedSection } from "@/lib/technical-terms";
import { cn } from "@/lib/utils";
import { useClosingTransition } from "@/components/ui/reveal";
import { usePortfolioSounds } from "@/components/sound-effects";

type SectionLink = Pick<PreparedSection, "id" | "title">;

interface ContentsViewProps {
  sections: SectionLink[];
  activeId: string;
  onSelect: (id: string) => void;
}

function ContentsLinks({ sections, activeId, onSelect, mobile = false }: ContentsViewProps & { mobile?: boolean }) {
  return sections.map((section) => (
    <button
      key={section.id}
      onClick={() => onSelect(section.id)}
      aria-current={activeId === section.id ? "location" : undefined}
      className={cn(
        "block w-full text-left text-sm transition-colors",
        mobile && "py-1",
        activeId === section.id ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {section.title}
    </button>
  ));
}

function MobileContents({ sections, activeId, onSelect }: ContentsViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isClosing = useClosingTransition(isOpen);
  const id = useId();
  const { playDropdownOpen, playDropdownClose } = usePortfolioSounds();

  return (
    <div className="relative lg:hidden mb-8">
      <button
        onClick={() => {
          if (isOpen) playDropdownClose();
          else playDropdownOpen();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-controls={isOpen || isClosing ? id : undefined}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <span>On this page</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {(isOpen || isClosing) && (
        <nav
          id={id}
          data-origin="top-center"
          className={cn(
            "t-dropdown absolute left-0 right-0 top-full z-20 mt-2 px-4 py-3 bg-muted/30 rounded-lg space-y-2",
            isOpen && "is-open",
            isClosing && "is-closing"
          )}
        >
          <ContentsLinks sections={sections} activeId={activeId} mobile onSelect={(id) => {
            onSelect(id);
            setIsOpen(false);
          }} />
        </nav>
      )}
    </div>
  );
}

export function TableOfContents({ sections, children }: { sections: SectionLink[]; children: ReactNode }) {
  const [activeId, setActiveId] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const { playTabSwitch } = usePortfolioSounds();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveId(entry.target.id);
      });
    }, { rootMargin: "-100px 0px -80% 0px" });
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  const handleSelect = (id: string) => {
    playTabSwitch();
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <MobileContents sections={sections} activeId={activeId} onSelect={handleSelect} />
      <div className="grid lg:grid-cols-[240px_1fr_280px] gap-8 lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">On this page</h3>
              <nav className="space-y-2">
                <ContentsLinks sections={sections} activeId={activeId} onSelect={handleSelect} />
              </nav>
            </div>
          </div>
        </aside>
        {children}
      </div>
    </>
  );
}
