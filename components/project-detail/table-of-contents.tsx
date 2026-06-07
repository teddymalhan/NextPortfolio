"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { ContentSection } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { useClosingTransition } from "@/components/ui/transition-primitives";

interface TableOfContentsProps {
  sections: ContentSection[];
  variant?: "desktop" | "mobile";
}

// Create a slug from section title for IDs (same as content-section.tsx)
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function TableOfContents({ sections, variant }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const isClosing = useClosingTransition(isOpen, "--dropdown-close-dur", 150);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -80% 0px",
      }
    );

    const sectionElements = sections.map((section) =>
      document.getElementById(createSlug(section.title))
    );

    sectionElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      sectionElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [sections]);

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  // Desktop View - Fixed Sidebar
  if (variant === "desktop") {
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              On this page
            </h3>
            <nav className="space-y-2">
              {sections.map((section) => {
                const sectionId = createSlug(section.title);
                const isActive = activeId === sectionId;
                return (
                  <button
                    key={sectionId}
                    onClick={() => handleClick(sectionId)}
                    className={`block w-full text-left text-sm transition-colors ${
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    );
  }

  // Mobile View - Dropdown
  return (
    <div className="relative lg:hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <span>On this page</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {(isOpen || isClosing) && (
        <nav
          data-origin="top-center"
          className={cn(
            "t-dropdown absolute left-0 right-0 top-full z-20 mt-2 px-4 py-3 bg-muted/30 rounded-lg space-y-2",
            isOpen && "is-open",
            isClosing && "is-closing"
          )}
        >
          {sections.map((section) => {
            const sectionId = createSlug(section.title);
            const isActive = activeId === sectionId;
            return (
              <button
                key={sectionId}
                onClick={() => handleClick(sectionId)}
                className={`block w-full text-left text-sm py-1 transition-colors ${
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {section.title}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
