"use client";

import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { usePortfolioSounds } from "@/components/sound-effects";

type Props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: Props) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { playToggleOn, playToggleOff } = usePortfolioSounds();

  const toggleTheme = useCallback(() => {
    if (isDark) {
      playToggleOff();
    } else {
      playToggleOn();
    }

    setTheme(isDark ? "light" : "dark");
  }, [setTheme, isDark, playToggleOn, playToggleOff]);

  return (
    <button
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
