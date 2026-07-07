"use client";

import {
  Home,
  Hammer,
  Briefcase,
  Mail,
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

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isResumeVisible: boolean;
  resumePath: string;
  scrollToSection: (href: string) => void;
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

  const handleAdminClick = () => {
    router.push("/admin/dashboard");
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
          <CommandItem
            onSelect={() => runCommand(() => scrollToSection("#home"))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => scrollToSection("#experience"))}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            <span>My Experience</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => scrollToSection("#projects"))}
          >
            <Hammer className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => scrollToSection("#about"))}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>About Me</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {isResumeVisible && (
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  // Force fresh fetch by adding current timestamp
                  const freshUrl = resumePath.includes("&t=")
                    ? `${resumePath.split("&t=")[0]}&t=${Date.now()}`
                    : `${resumePath}?t=${Date.now()}`;
                  window.open(freshUrl, "_blank", "noopener,noreferrer");
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
                window.open("https://github.com/teddymalhan", "_blank");
              })
            }
          >
            <Github className="mr-2 h-4 w-4" />
            <span>View GitHub Profile</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                window.open("https://linkedin.com/in/teddymalhan", "_blank");
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
          <CommandItem onSelect={() => runCommand(handleAdminClick)}>
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

