"use client";

import { X } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export function useMountedReveal() {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return isShown;
}

export function useClosingTransition(isOpen: boolean, cssDurationVar: string, fallbackMs: number) {
  const [isClosing, setIsClosing] = useState(false);
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      setIsClosing(false);
      return;
    }

    if (!wasOpenRef.current) return;

    wasOpenRef.current = false;
    setIsClosing(true);
    const cssValue = getComputedStyle(document.documentElement).getPropertyValue(cssDurationVar);
    const closeMs = parseFloat(cssValue) || fallbackMs;
    const timeout = window.setTimeout(() => setIsClosing(false), closeMs);

    return () => window.clearTimeout(timeout);
  }, [fallbackMs, isOpen, cssDurationVar]);

  return isClosing;
}

type AnimatedTextProps = {
  value: string;
  className?: string;
};

export function AnimatedText({ value, className }: AnimatedTextProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [phaseClass, setPhaseClass] = useState("");
  const valueRef = useRef(value);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (valueRef.current === value) return;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    const cssValue = getComputedStyle(document.documentElement).getPropertyValue("--text-swap-dur");
    const duration = parseFloat(cssValue) || 150;
    setPhaseClass("is-exit");

    timeoutRef.current = window.setTimeout(() => {
      valueRef.current = value;
      setDisplayValue(value);
      setPhaseClass("is-enter-start");
      requestAnimationFrame(() => {
        setPhaseClass("");
      });
    }, duration);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  return <span className={cn("t-text-swap", phaseClass, className)}>{displayValue}</span>;
}

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

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn("t-tt-wrap", className)}>
      <span className="t-tt-trigger">{children}</span>
      <span className="t-tt text-xs font-medium" role="tooltip">
        {label}
      </span>
    </span>
  );
}

export function useAvatarGroup() {
  const groupRef = useRef<HTMLDivElement>(null);

  const setShifts = useCallback((activeIndex: number | null, phase: "in" | "out") => {
    const root = groupRef.current;
    if (!root) return;

    const computed = getComputedStyle(document.documentElement);
    const readNumber = (name: string, fallback: number) => {
      const parsed = parseFloat(computed.getPropertyValue(name));
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const readEase = (name: string, fallback: string) => computed.getPropertyValue(name).trim() || fallback;

    const lift = readNumber("--avatar-lift", -4);
    const falloff = readNumber("--avatar-falloff", 0.45);
    const scale = readNumber("--avatar-scale", 1.05);
    const timing =
      phase === "out"
        ? readEase("--avatar-ease-out", "cubic-bezier(0.34, 3.85, 0.64, 1)")
        : readEase("--avatar-ease-in", "cubic-bezier(0.22, 1, 0.36, 1)");

    root.querySelectorAll<HTMLElement>(".t-avatar").forEach((element, index) => {
      element.style.transitionTimingFunction = timing;
      if (activeIndex === null) {
        element.style.setProperty("--shift", "0px");
        element.style.setProperty("--scale-active", "1");
        return;
      }

      const distance = Math.abs(index - activeIndex);
      element.style.setProperty("--shift", `${(lift * Math.pow(falloff, distance)).toFixed(3)}px`);
      element.style.setProperty("--scale-active", index === activeIndex ? String(scale) : "1");
    });
  }, []);

  return {
    groupRef,
    onGroupMouseLeave: () => setShifts(null, "out"),
    getAvatarProps: (index: number) => ({
      onMouseEnter: () => setShifts(index, "in"),
    }),
  };
}

export function useTabsPill(activeValue: string) {
  const rootRef = useRef<HTMLDivElement>(null);

  const moveToActive = useCallback((animate: boolean) => {
    const root = rootRef.current;
    if (!root) return;

    const pill = root.querySelector<HTMLElement>(".t-tabs-pill");
    const tabs = Array.from(root.querySelectorAll<HTMLElement>(".t-tab"));
    const activeTab = tabs.find((tab) => tab.dataset.tabValue === activeValue) ?? tabs[0];
    if (!pill || !activeTab) return;

    if (!animate) {
      const previousTransition = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
      pill.style.width = `${activeTab.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = previousTransition;
      return;
    }

    pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    pill.style.width = `${activeTab.offsetWidth}px`;
  }, [activeValue]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => moveToActive(false));
    const handleResize = () => moveToActive(false);
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [moveToActive]);

  useEffect(() => {
    moveToActive(true);
  }, [moveToActive]);

  return rootRef;
}

export function useInputErrorShake() {
  const inputRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);
  const [message, setMessage] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const clearError = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage("");
    setIsShaking(false);
  }, []);

  const showError = useCallback((nextMessage: string) => {
    const computed = getComputedStyle(document.documentElement);
    const readNumber = (name: string, fallback: number) => {
      const parsed = parseFloat(computed.getPropertyValue(name));
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setMessage(nextMessage);
    setIsShaking(false);
    requestAnimationFrame(() => {
      if (inputRef.current) void inputRef.current.offsetWidth;
      setIsShaking(true);
    });

    const shakeMs = readNumber("--shake-dur-a", 80) * 2 + readNumber("--shake-dur-b", 60) * 2;
    const holdMs = readNumber("--revert-hold", 3000);
    timerRef.current = window.setTimeout(clearError, shakeMs + holdMs);
  }, [clearError]);

  useEffect(() => clearError, [clearError]);

  return {
    inputRef,
    message,
    isError: message.length > 0,
    isShaking,
    showError,
    clearError,
  };
}

type AnimatedNumberProps = {
  value: string;
  className?: string;
};

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const groupRef = useRef<HTMLSpanElement>(null);
  const chars = useMemo(() => Array.from(value), [value]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.classList.remove("is-animating");
    void group.offsetHeight;
    group.classList.add("is-animating");
  }, [value]);

  return (
    <span ref={groupRef} className={cn("t-digit-group is-animating", className)} aria-label={value}>
      {chars.map((char, index) => {
        const stagger = index === chars.length - 2 ? "1" : index === chars.length - 1 ? "2" : undefined;

        return (
          <span key={`${char}-${index}`} className="t-digit" data-stagger={stagger} aria-hidden="true">
            {char}
          </span>
        );
      })}
    </span>
  );
}

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

  const clearWithAnimation = useCallback(() => {
    const wrap = wrapRef.current;
    const input = inputRef.current;
    const mirror = mirrorRef.current;
    const placeholderEl = placeholderRef.current;
    const glow = glowRef.current;
    const canvas = document.createElement("canvas").getContext("2d");
    if (clearingRef.current || !value || !wrap || !input || !mirror || !placeholderEl || !glow || !canvas) return;

    clearingRef.current = true;
    const text = value;
    const keepFocus = document.activeElement === input;
    setClearingText(text);
    mirror.textContent = text.replace(/ /g, "\u00a0");

    const total = num("--clear-dur", 1000);
    const outDur = num("--clear-out-dur", 400);
    const inDur = num("--clear-in-dur", 400);
    const outFly = num("--clear-out-fly", 12);
    const inFly = num("--clear-in-fly", 12);
    const blur = num("--clear-blur", 2);
    const delay = num("--glow-delay", 50);
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
      const outProgress = easeOut(Math.min(1, elapsed / outDur));
      mirror.style.transform = `translateY(${(outProgress * outFly).toFixed(1)}px)`;
      mirror.style.opacity = (1 - outProgress).toFixed(3);
      mirror.style.filter = `blur(${(outProgress * blur).toFixed(1)}px)`;

      const inProgress = easeIn(Math.min(1, elapsed / inDur));
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

      wrap.classList.remove("is-clearing");
      mirror.style.cssText = "";
      placeholderEl.style.cssText = "";
      glow.style.opacity = "0";
      glow.style.background = "";
      clearingRef.current = false;
      setClearingText("");
      if (keepFocus) requestAnimationFrame(() => input.focus({ preventScroll: true }));
    };

    animationRef.current = requestAnimationFrame(tick);
  }, [buildGlow, onValueChange, value]);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn("t-clear", value && "has-value", wrapperClassName)}
    >
      {leadingIcon}
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder=""
        aria-label={ariaLabel ?? (typeof placeholder === "string" ? placeholder : undefined)}
        className={className}
        {...props}
      />
      <div className={cn("t-clear-mirror text-foreground", textClassName)} aria-hidden="true">
        {mirrorText.replace(/ /g, "\u00a0")}
      </div>
      <div className={cn("t-clear-placeholder text-muted-foreground", textClassName)} aria-hidden="true">
        {placeholder}
      </div>
      <div className="t-clear-glow" aria-hidden="true" />
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
