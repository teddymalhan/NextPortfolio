"use client";

import { useEffect } from "react";
import { useResumeManagerStore } from "./resume-manager-store";
import { ResumeStats } from "./resume-stats";
import { ResumeVisibilityCard } from "./resume-visibility-card";
import { ResumeListSection } from "./resume-list-section";
import { ResumeUploadSection } from "./resume-upload-section";
import { ResumeDialogs } from "./resume-dialogs";

export function ResumeManager() {
  const fetchResumes = useResumeManagerStore((state) => state.fetchResumes);
  const fetchVisibility = useResumeManagerStore((state) => state.fetchVisibility);

  useEffect(() => {
    fetchResumes();
    fetchVisibility();
  }, [fetchResumes, fetchVisibility]);

  return (
    <div className="space-y-8">
      <ResumeStats />
      <ResumeVisibilityCard />
      <ResumeListSection />
      <ResumeUploadSection />
      <ResumeDialogs />
    </div>
  );
}
