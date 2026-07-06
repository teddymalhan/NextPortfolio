"use client";

import { useCallback, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { usePortfolioSounds } from "@/components/sound-effects";

type Props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: Props) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { playToggleOn, playToggleOff } = usePortfolioSounds();

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;
    if (isDark) {
      playToggleOff();
    } else {
      playToggleOn();
    }

    // Type assertion for View Transition API
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => { ready: Promise<void> };
    };

    const updateTheme = () => {
      flushSync(() => {
        setTheme(theme === "dark" ? "light" : "dark");
      });
    };

    if (doc.startViewTransition) {
      const transition = doc.startViewTransition(updateTheme);
      await transition.ready;
    } else {
      updateTheme();
      return;
    }

    
  }, [theme, setTheme, isDark, playToggleOn, playToggleOff]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="t-icon-swap" data-state={isDark ? "a" : "b"}>
        <span className="t-icon" data-icon="a">
          <Sun className="h-4 w-4 text-foreground" />
        </span>
        <span className="t-icon" data-icon="b">
          <Moon className="h-4 w-4 text-foreground" />
        </span>
      </span>
    </button>
  );
};
