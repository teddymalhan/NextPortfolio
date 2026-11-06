"use client";

import { X } from "lucide-react";
import { type ComponentPropsWithoutRef, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { readCssDuration } from "@/lib/css-duration";

type ClearableInputProps = Omit<ComponentPropsWithoutRef<"input">, "onChange" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  wrapperClassName?: string;
  textClassName?: string;
  leadingIcon?: ReactNode;
};

const num = (name: string, fallback: number) => {
  const parsed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bezier = (value: string) => {
  const match = String(value).match(/cubic-bezier\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
  if (!match) return (t: number) => t;

  const [x1, y1, x2, y2] = match.slice(1).map(Number);
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    let sample = t;
    for (let i = 0; i < 8; i++) {
      const dx = ((ax * sample + bx) * sample + cx) * sample - t;
      const derivative = (3 * ax * sample + 2 * bx) * sample + cx;
      if (Math.abs(dx) < 1e-6 || derivative === 0) break;
      sample -= dx / derivative;
    }

    return ((ay * sample + by) * sample + cy) * sample;
  };
};

export function ClearableInput({
  value,
  onValueChange,
  wrapperClassName,
  textClassName,
  className,
  leadingIcon,
  placeholder,
  "aria-label": ariaLabel,
  ...props
}: ClearableInputProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const clearingRef = useRef(false);
  const [clearingText, setClearingText] = useState("");
  const mirrorText = clearingText || value;

  const buildGlow = useCallback((text: string, canvas: CanvasRenderingContext2D) => {
    const wrap = wrapRef.current;
    const input = inputRef.current;
    if (!wrap || !input) return "";

    canvas.font = getComputedStyle(input).font;
    const root = document.documentElement;
    const isDark = root.classList.contains("dark") || root.dataset.theme === "dark";
    const rgb = isDark ? "255,255,255" : "0,0,0";
    const width = wrap.clientWidth || 280;
    const padLeft = parseFloat(getComputedStyle(input).paddingLeft) || 12;
    const spread = num("--glow-spread", 1.5);
    const layers: string[] = [];
    let x = 0;

    text.split(/(\s+)/).forEach((segment) => {
      const segmentWidth = canvas.measureText(segment).width;
      if (segment.trim()) {
        const centerX = padLeft + x + segmentWidth / 2;
        const halfWidth = Math.max(segmentWidth * 0.45, 8) * spread;
        [
          [0, 0.8, 7, 0.22],
          [halfWidth * 0.45, 0.55, 8, 0.18],
          [-halfWidth * 0.4, 0.65, 6, 0.16],
          [halfWidth * 0.15, 0.9, 5, 0.14],
        ].forEach(([dx, radiusWidth, radiusHeight, alpha]) => {
          const layerX = (((centerX + dx) / width) * 100).toFixed(2);
          layers.push(
            `radial-gradient(ellipse ${Math.max(halfWidth * radiusWidth, 2).toFixed(1)}px ${radiusHeight}px at ${layerX}% 100%, rgba(${rgb},${alpha}), transparent)`,
          );
        });
      }
      x += segmentWidth;
    });

    return layers.join(", ");
  }, []);

  const resetAnimation = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    wrapRef.current?.classList.remove("is-clearing");
    if (mirrorRef.current) mirrorRef.current.style.cssText = "";
    if (placeholderRef.current) placeholderRef.current.style.cssText = "";
    if (glowRef.current) glowRef.current.style.cssText = "";
    clearingRef.current = false;
  }, []);

  const clearWithAnimation = useCallback(() => {
    const wrap = wrapRef.current;
    const input = inputRef.current;
    const mirror = mirrorRef.current;
    const placeholderEl = placeholderRef.current;
    const glow = glowRef.current;
    if (clearingRef.current || !value || !wrap || !input || !mirror || !placeholderEl || !glow) return;
    const canvas = document.createElement("canvas").getContext("2d");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !canvas) {
      resetAnimation();
      setClearingText("");
      onValueChange("");
      return;
    }

    clearingRef.current = true;
    const text = value;
    setClearingText(text);
    mirror.textContent = text.replace(/ /g, "\u00a0");

    const total = readCssDuration("--clear-dur", 1000);
    const outDur = readCssDuration("--clear-out-dur", 400);
    const inDur = readCssDuration("--clear-in-dur", 400);
    const outFly = num("--clear-out-fly", 12);
    const inFly = num("--clear-in-fly", 12);
    const blur = num("--clear-blur", 2);
    const delay = readCssDuration("--glow-delay", 50);
    const peakAt = num("--glow-peak-at", 0.15);
    const glowOpacity = num("--glow-opacity", 0.42);
    const easeOut = bezier(getComputedStyle(document.documentElement).getPropertyValue("--clear-out-ease"));
    const easeIn = bezier(getComputedStyle(document.documentElement).getPropertyValue("--clear-in-ease"));

    onValueChange("");
    wrap.classList.remove("has-value");
    wrap.classList.add("is-clearing");
    glow.style.background = buildGlow(text, canvas);
    glow.style.opacity = "0";
    placeholderEl.style.transform = `translateY(-${inFly}px)`;
    placeholderEl.style.opacity = "0.9";
    placeholderEl.style.filter = `blur(${blur}px)`;

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const outProgress = easeOut(outDur === 0 ? 1 : Math.min(1, elapsed / outDur));
      mirror.style.transform = `translateY(${(outProgress * outFly).toFixed(1)}px)`;
      mirror.style.opacity = (1 - outProgress).toFixed(3);
      mirror.style.filter = `blur(${(outProgress * blur).toFixed(1)}px)`;

      const inProgress = easeIn(inDur === 0 ? 1 : Math.min(1, elapsed / inDur));
      placeholderEl.style.transform = `translateY(${(-inFly + inProgress * inFly).toFixed(1)}px)`;
      placeholderEl.style.opacity = (0.9 + inProgress * 0.1).toFixed(3);
      placeholderEl.style.filter = `blur(${(blur - inProgress * blur).toFixed(1)}px)`;

      let glowProgress = 0;
      if (elapsed > delay) {
        const normalized = Math.min(1, (elapsed - delay) / Math.max(1, total - delay));
        glowProgress = normalized < peakAt ? normalized / peakAt : 1 - (normalized - peakAt) / (1 - peakAt);
      }
      glow.style.opacity = (glowProgress * glowOpacity).toFixed(3);

      if (elapsed < total) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      resetAnimation();
      setClearingText("");
    };

    animationRef.current = requestAnimationFrame(tick);
  }, [buildGlow, onValueChange, resetAnimation, value]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      if (media.matches) {
        resetAnimation();
        setClearingText("");
      }
    };
    media.addEventListener("change", handleMotionChange);
    return () => {
      media.removeEventListener("change", handleMotionChange);
      resetAnimation();
    };
  }, [resetAnimation]);

  return (
    <div
      ref={wrapRef}
      className={cn("t-clear", value && "has-value", wrapperClassName)}
    >
      {leadingIcon}
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => {
          resetAnimation();
          setClearingText("");
          onValueChange(event.target.value);
        }}
        placeholder=""
        aria-label={ariaLabel ?? (typeof placeholder === "string" ? placeholder : undefined)}
        className={className}
        {...props}
      />
      <div ref={mirrorRef} className={cn("t-clear-mirror text-foreground", textClassName)} aria-hidden="true">
        {mirrorText.replace(/ /g, "\u00a0")}
      </div>
      <div ref={placeholderRef} className={cn("t-clear-placeholder text-muted-foreground", textClassName)} aria-hidden="true">
        {placeholder}
      </div>
      <div ref={glowRef} className="t-clear-glow" aria-hidden="true" />
      <button
        type="button"
        className={cn(
          "t-clear-btn absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-opacity hover:bg-accent hover:text-foreground",
          value || clearingText ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="Clear search"
        onPointerDown={(event) => {
          if (document.activeElement === inputRef.current) event.preventDefault();
        }}
        onMouseDown={(event) => {
          if (document.activeElement === inputRef.current) event.preventDefault();
        }}
        onClick={clearWithAnimation}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
