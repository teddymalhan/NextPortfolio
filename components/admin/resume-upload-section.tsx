"use client";

import { m, useReducedMotion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInputErrorShake } from "@/components/ui/input-feedback";
import { useResumeManagerStore } from "./resume-manager-store";
import { cn } from "@/lib/utils";
import { MAX_RESUME_FILE_SIZE } from "@/lib/validations/resume";

const REDUCED_MOTION_VARIANTS = {} as const;

export function ResumeUploadSection() {
  const pending = useResumeManagerStore((state) => state.pending);
  const uploading = pending?.kind === "upload";
  const autoSetActive = useResumeManagerStore((state) => state.autoSetActive);
  const handleUploadAction = useResumeManagerStore((state) => state.handleUpload);
  const setAutoSetActive = useResumeManagerStore((state) => state.setAutoSetActive);
  const prefersReducedMotion = useReducedMotion();
  const { setInputRef, clearError, showError, isError, isShaking, message } = useInputErrorShake();

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const input = event.currentTarget;
    clearError();
    const result = await handleUploadAction(file);
    if (result.status === "error") showError(result.error);
    input.value = "";
  }

  return (
    <m.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border border-border dark:border-border/80 dark:bg-card/50">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Upload New Resume</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a new PDF resume. Maximum file size: {MAX_RESUME_FILE_SIZE / (1024 * 1024)}MB
          </p>
          <div className="flex flex-col gap-4">
            <div className={cn("t-input-wrap", isError && "is-error")}>
              <label aria-label="Upload PDF resume file" className="flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUpload}
                  disabled={!!pending}
                  className="hidden"
                />
                <Button disabled={!!pending} asChild>
                  <span
                    ref={setInputRef}
                    className={cn(
                      "t-input",
                      isError && "is-error border-destructive text-destructive",
                      isShaking && "is-shaking",
                    )}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="t-shimmer" data-text="Uploading...">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose PDF File
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="t-error-msg mt-2 text-sm text-destructive">{message}</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSetActive}
                onChange={(e) => setAutoSetActive(e.target.checked)}
                disabled={!!pending}
                className="w-4 h-4 rounded border-input accent-primary"
              />
              <span className="text-sm text-muted-foreground">
                Automatically set as active resume after upload
              </span>
            </label>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}
