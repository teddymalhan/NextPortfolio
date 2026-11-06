import { Briefcase, Hammer, Home, Mail } from "lucide-react";

export const navigationSections = [
  { id: "home", label: "home", commandLabel: "Home", emoji: "🏠", icon: Home, offset: 20 },
  { id: "experience", label: "my experience", commandLabel: "My Experience", emoji: "💼", icon: Briefcase, offset: 40 },
  { id: "projects", label: "projects", commandLabel: "Projects", emoji: "🛠️", icon: Hammer, offset: 20 },
  { id: "about", label: "about me", commandLabel: "About Me", emoji: "👤", icon: Mail, offset: 20 },
] as const;

export type SectionId = (typeof navigationSections)[number]["id"];

export function scrollToSection(id: SectionId) {
  const element = document.getElementById(id);
  if (!element) return;
  const section = navigationSections.find((section) => section.id === id)!;
  window.scrollTo({
    top: Math.max(0, element.getBoundingClientRect().top + window.scrollY - section.offset),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export function getActiveSection(): SectionId | null {
  if (window.scrollY < window.innerHeight / 2) return "home";
  for (const section of navigationSections) {
    const rect = document.getElementById(section.id)?.getBoundingClientRect();
    if (rect && rect.top <= 100 && rect.bottom > 100) return section.id;
  }
  return null;
}
