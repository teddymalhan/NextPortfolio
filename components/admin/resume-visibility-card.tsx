"use client";

import { m, useReducedMotion } from "framer-motion";
import { Loader2, EyeOff, Eye as EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedText } from "@/components/ui/transition-primitives";
import { useResumeManagerStore } from "@/stores";

const REDUCED_MOTION_VARIANTS = {} as const;

export function ResumeVisibilityCard() {
  const isResumeVisible = useResumeManagerStore((state) => state.isResumeVisible);
  const togglingVisibility = useResumeManagerStore((state) => state.togglingVisibility);
  const cooldown = useResumeManagerStore((state) => state.cooldown);
  const toggleVisibility = useResumeManagerStore((state) => state.toggleVisibility);
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border border-border dark:border-border/80 dark:bg-card/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Resume Visibility</h3>
              <p className="text-sm text-muted-foreground">
                {isResumeVisible
                  ? "Resume is currently visible on the website. Visitors can view and download it."
                  : "Resume is currently hidden. No one can access it on the website."}
              </p>
            </div>
            <Button
              onClick={toggleVisibility}
              disabled={togglingVisibility || cooldown}
              variant={isResumeVisible ? "destructive" : "default"}
              className="shrink-0"
            >
              {togglingVisibility ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isResumeVisible ? "Hiding..." : "Showing..."}
                </>
              ) : (
                <>
                  <span className="t-icon-swap mr-2" data-state={isResumeVisible ? "a" : "b"}>
                    <span className="t-icon" data-icon="a">
                      <EyeOff className="w-4 h-4" />
                    </span>
                    <span className="t-icon" data-icon="b">
                      <EyeIcon className="w-4 h-4" />
                    </span>
                  </span>
                  <AnimatedText value={isResumeVisible ? "Hide Resume" : "Show Resume"} />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}
