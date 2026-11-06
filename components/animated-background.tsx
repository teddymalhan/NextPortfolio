"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

export function AnimatedBackground() {
  const { resolvedTheme } = useTheme();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 h-screen overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute inset-0">
        {/* Light mode gradients - GitHub Light blue tones */}
        {resolvedTheme === "light" && (
          <>
            <div
              className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(84, 174, 255, 0.3) 0%, transparent 70%)',
                animationDuration: '8s',
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-15 animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(9, 105, 218, 0.25) 0%, transparent 70%)',
                animationDuration: '10s',
                animationDelay: '2s',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[90px] opacity-10 animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(130, 80, 223, 0.2) 0%, transparent 70%)',
                animationDuration: '12s',
                animationDelay: '4s',
              }}
            />
          </>
        )}

        {/* Dark mode gradients - GitHub Dark blue tones */}
        {resolvedTheme === "dark" && (
          <>
            <div
              className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[130px] opacity-25 animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(56, 139, 253, 0.3) 0%, transparent 70%)',
                animationDuration: '9s',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-[650px] h-[650px] rounded-full blur-[110px] opacity-20 animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(31, 111, 235, 0.25) 0%, transparent 70%)',
                animationDuration: '11s',
                animationDelay: '3s',
              }}
            />
            <div
              className="absolute top-1/3 left-1/4 w-[550px] h-[550px] rounded-full blur-[95px] opacity-15 animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(163, 113, 247, 0.2) 0%, transparent 70%)',
                animationDuration: '13s',
                animationDelay: '5s',
              }}
            />
          </>
        )}
      </div>

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.05) 100%)',
        }}
      />
    </div>
  );
}
