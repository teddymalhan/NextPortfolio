"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useResumeManagerStore } from "./resume-manager-store";

export function ResumeDialogs() {
  const dialog = useResumeManagerStore((state) => state.dialog);
  const resume = useResumeManagerStore((state) => state.resumes.find((record) => record.id === state.dialog?.id));
  const pending = useResumeManagerStore((state) => state.pending);
  const closeDialog = useResumeManagerStore((state) => state.closeDialog);
  const saveDialog = useResumeManagerStore((state) => state.saveDialog);
  const setDialogDraft = useResumeManagerStore((state) => state.setDialogDraft);
  const saving = pending?.kind === "notes" || pending?.kind === "rename";

  return (
    <Dialog open={!!dialog && !!resume} onOpenChange={(open) => !open && closeDialog()}>
      {dialog?.kind === "preview" ? (
        <DialogContent className="!max-w-none !w-screen !h-screen !top-0 !left-0 !translate-x-0 !translate-y-0 !m-0 !rounded-none !p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>{resume?.filename}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6 min-h-0">
            {resume && (
              <iframe
                src={resume.path}
                className="w-full h-full border-0 rounded-lg"
                title={`Preview of ${resume.filename}`}
              />
            )}
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="max-w-2xl border border-border dark:border-border/80 dark:bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {dialog?.kind === "notes" ? `Edit Notes - ${resume?.filename}` : "Rename Resume"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {dialog?.kind === "notes" ? (
              <textarea
                aria-label="Resume notes"
                value={dialog.draft}
                disabled={saving}
                onChange={(event) => setDialogDraft(event.target.value)}
                placeholder="Add notes about this resume version (e.g., 'Updated for tech roles', 'Added new project')..."
                className="w-full min-h-[120px] px-4 py-3 text-sm rounded-xl border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                rows={5}
              />
            ) : (
              <>
                <label htmlFor="rename-input" className="text-sm font-medium mb-2 block">
                  Filename
                </label>
                <input
                  id="rename-input"
                  type="text"
                  value={dialog?.draft ?? ""}
                  disabled={saving}
                  onChange={(event) => setDialogDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveDialog();
                    }
                  }}
                  placeholder="Enter new filename..."
                  className="w-full px-4 py-3 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This will only change the display name, not the actual file.
                </p>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={saveDialog} disabled={saving}>
              {saving ? "Saving..." : dialog?.kind === "notes" ? "Save Notes" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
