"use client";

import {
  FileText,
  Github,
  Linkedin,
  LogIn,
  Shield,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { usePortfolioSounds } from "@/components/sound-effects";
import { navigationSections, type SectionId } from "./navigation-sections";
import { site } from "@/lib/site";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isResumeVisible: boolean;
  resumePath: string | null;
  scrollToSection: (id: SectionId) => void;
  triggerConfetti: () => void;
}

function CommandPalette({
  open,
  onOpenChange,
  isResumeVisible,
  resumePath,
  scrollToSection,
  triggerConfetti,
}: CommandPaletteProps) {
  const router = useRouter();
  const { playSelect, playEscape, playConfetti } = usePortfolioSounds();

  const runCommand = (command: () => void, playBeforeClose: () => void = playSelect) => {
    playBeforeClose();
    onOpenChange(false);
    command();
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      playEscape();
    }
    onOpenChange(nextOpen);
  };


  return (
    <CommandDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Search Portfolio"
      description="Quickly navigate to any section or find what you're looking for"
    >
      <CommandInput placeholder="Type to search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationSections.map((section) => (
            <CommandItem
              key={section.id}
              onSelect={() => runCommand(() => scrollToSection(section.id))}
            >
              <section.icon className="mr-2 h-4 w-4" />
              <span>{section.commandLabel}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {isResumeVisible && resumePath && (
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  window.open(resumePath, "_blank", "noopener,noreferrer");
                })
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Download Resume</span>
            </CommandItem>
          )}
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                window.open(site.links.github, "_blank", "noopener,noreferrer");
              })
            }
          >
            <Github className="mr-2 h-4 w-4" />
            <span>View GitHub Profile</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                window.open(site.links.linkedin, "_blank", "noopener,noreferrer");
              })
            }
          >
            <Linkedin className="mr-2 h-4 w-4" />
            <span>Connect on LinkedIn</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Authentication">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/sign-in"))}
          >
            <LogIn className="mr-2 h-4 w-4" />
            <span>Sign In</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/admin/dashboard"))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Fun">
          <CommandItem onSelect={() => runCommand(() => triggerConfetti(), playConfetti)}>
            <span className="mr-2">🎉</span>
            <span>Trigger Confetti</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;

