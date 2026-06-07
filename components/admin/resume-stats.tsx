"use client";

import { useMemo } from "react";
import { m, useReducedMotion } from "framer-motion";
import { HardDrive, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/transition-primitives";
import { useResumeManagerStore } from "@/stores";

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
} as const;

const REDUCED_MOTION_VARIANTS = {} as const;

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeStats() {
  const resumes = useResumeManagerStore((state) => state.resumes);
  const prefersReducedMotion = useReducedMotion();

  const { activeResume, totalStorage, lastUpload } = useMemo(() => {
    if (resumes.length === 0) {
      return { activeResume: undefined, totalStorage: 0, lastUpload: null };
    }
    let active: typeof resumes[0] | undefined;
    let storage = 0;
    let latest = resumes[0];
    for (const resume of resumes) {
      if (resume.isActive) active = resume;
      storage += resume.fileSize || 0;
      if (new Date(resume.uploadedAt) > new Date(latest.uploadedAt)) latest = resume;
    }
    return { activeResume: active, totalStorage: storage, lastUpload: latest };
  }, [resumes]);

  return (
    <m.div
      variants={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : CONTAINER_VARIANTS}
      initial={prefersReducedMotion ? false : "hidden"}
      animate={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : "show"}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <m.div variants={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : ITEM_VARIANTS}>
        <Card className="border border-border dark:border-border/80 dark:bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Active Resume</p>
                {activeResume ? (
                  <>
                    <p className="text-sm font-semibold mt-2 truncate">{activeResume.filename}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activeResume.uploadedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">None</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center shrink-0 ml-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>

      <m.div variants={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : ITEM_VARIANTS}>
        <Card className="border border-border dark:border-border/80 dark:bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Storage</p>
                <p className="text-3xl font-bold mt-2">
                  <AnimatedNumber value={formatFileSize(totalStorage)} />
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>

      <m.div variants={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : ITEM_VARIANTS}>
        <Card className="border border-border dark:border-border/80 dark:bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Last Upload</p>
                {lastUpload ? (
                  <>
                    <p className="text-sm font-semibold mt-2">
                      {new Date(lastUpload.uploadedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(lastUpload.uploadedAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">Never</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center shrink-0 ml-2">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </m.div>
  );
}
