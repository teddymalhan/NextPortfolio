"use client";

import { useCallback, type ReactNode } from "react";
import { SoundProvider, usePatch } from "@web-kits/audio/react";
import { core } from "@/.web-kits";

export function PortfolioSoundProvider({ children }: { children: ReactNode }) {
  return <SoundProvider volume={0.32}>{children}</SoundProvider>;
}

export function usePortfolioSounds() {
  const patch = usePatch(core._patch);

  const play = useCallback(
    (name: string, volume: number) => {
      if (!patch.ready) return;
      try {
        patch.play(name, { volume });
      } catch {}
    },
    [patch]
  );

  const playClick = useCallback(() => play("click", 0.45), [play]);
  const playCommand = useCallback(() => play("command", 0.55), [play]);
  const playEscape = useCallback(() => play("escape", 0.45), [play]);
  const playDrawerOpen = useCallback(() => play("drawer-open", 0.5), [play]);
  const playDrawerClose = useCallback(() => play("drawer-close", 0.45), [play]);
  const playDropdownOpen = useCallback(() => play("dropdown-open", 0.5), [play]);
  const playDropdownClose = useCallback(() => play("dropdown-close", 0.45), [play]);
  const playTabSwitch = useCallback(() => play("tab-switch", 0.45), [play]);
  const playPageExit = useCallback(() => play("page-exit", 0.45), [play]);
  const playPageEnter = useCallback(() => play("page-enter", 0.4), [play]);
  const playToggleOn = useCallback(() => play("toggle-on", 0.5), [play]);
  const playToggleOff = useCallback(() => play("toggle-off", 0.45), [play]);
  const playConfetti = useCallback(() => play("confetti", 0.55), [play]);
  const playSelect = useCallback(() => play("select", 0.45), [play]);
  const playSend = useCallback(() => play("send", 0.45), [play]);
  const playSlideDown = useCallback(() => play("slide-down", 0.4), [play]);

  return {
    playClick,
    playCommand,
    playEscape,
    playDrawerOpen,
    playDrawerClose,
    playDropdownOpen,
    playDropdownClose,
    playTabSwitch,
    playPageExit,
    playPageEnter,
    playToggleOn,
    playToggleOff,
    playConfetti,
    playSelect,
    playSend,
    playSlideDown,
  };
}
