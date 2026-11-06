"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { readCssDuration } from "@/lib/css-duration";

type SuccessCheckProps = {
  active: boolean;
  className?: string;
};

export function SuccessCheck({ active, className }: SuccessCheckProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !active) return;

    wrap.setAttribute("data-state", "out");
    wrap.querySelectorAll("path").forEach((path) => {
      const length = Math.ceil(path.getTotalLength());
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    });
    void wrap.offsetWidth;
    wrap.setAttribute("data-state", "in");
  }, [active]);

  return (
    <span
      ref={wrapRef}
      className={cn("t-success-check", className)}
      data-state={active ? "in" : "out"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path
          d="M5 12.5L9.25 16.75L19 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function useInputErrorShake() {
  const inputRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const [message, setMessage] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const setInputRef = useCallback((node: HTMLElement | null) => {
    inputRef.current = node;
  }, []);

  const clearError = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage("");
    setIsShaking(false);
  }, []);

  const showError = useCallback((nextMessage: string) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setMessage(nextMessage);
    setIsShaking(false);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (inputRef.current) void inputRef.current.offsetWidth;
      setIsShaking(true);
    });

    const shakeMs = readCssDuration("--shake-dur-a", 80) * 2 + readCssDuration("--shake-dur-b", 60) * 2;
    const holdMs = readCssDuration("--revert-hold", 3000);
    timerRef.current = window.setTimeout(clearError, shakeMs + holdMs);
  }, [clearError]);

  useEffect(() => clearError, [clearError]);

  return {
    setInputRef,
    message,
    isError: message.length > 0,
    isShaking,
    showError,
    clearError,
  };
}
