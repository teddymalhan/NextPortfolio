"use client";

import { useMemo, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import {
  Trash2,
  Check,
  FileText,
  Download,
  Loader2,
  Eye,
  Edit2,
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  ExternalLink,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClearableInput, SuccessCheck, Tooltip } from "@/components/ui/transition-primitives";
import { useResumeManagerStore } from "@/stores";

const REDUCED_MOTION_VARIANTS = {} as const;

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeListSection() {
  const resumes = useResumeManagerStore((state) => state.resumes);
  const loading = useResumeManagerStore((state) => state.loading);
  const searchQuery = useResumeManagerStore((state) => state.searchQuery);
  const filterStatus = useResumeManagerStore((state) => state.filterStatus);
  const sortBy = useResumeManagerStore((state) => state.sortBy);
  const selectedResumes = useResumeManagerStore((state) => state.selectedResumes);
  const {
    setActive,
    deleteResume,
    copyResumeLink,
    toggleResumeSelection,
    bulkDelete,
    openEditNotes,
    openRename,
    setPreviewResume,
    setSearchQuery,
    setFilterStatus,
    setSortBy,
    toggleSelectAll,
  } = useResumeManagerStore();
  const prefersReducedMotion = useReducedMotion();
  const [copiedResumeId, setCopiedResumeId] = useState<number | null>(null);

  const handleCopyResumeLink = async (resume: (typeof resumes)[number]) => {
    await copyResumeLink(resume);
    setCopiedResumeId(resume.id);
    window.setTimeout(() => setCopiedResumeId((current) => (current === resume.id ? null : current)), 1800);
  };

  const filteredAndSortedResumes = useMemo(() => {
    let filtered = resumes;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.filename.toLowerCase().includes(query) ||
          (r.notes && r.notes.toLowerCase().includes(query)),
      );
    }
    if (filterStatus === "active") filtered = filtered.filter((r) => r.isActive);
    else if (filterStatus === "inactive") filtered = filtered.filter((r) => !r.isActive);
    return filtered.toSorted((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "date-asc":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "name-asc":
          return a.filename.localeCompare(b.filename);
        case "name-desc":
          return b.filename.localeCompare(a.filename);
        case "size-desc":
          return (b.fileSize || 0) - (a.fileSize || 0);
        case "size-asc":
          return (a.fileSize || 0) - (b.fileSize || 0);
        default:
          return 0;
      }
    });
  }, [resumes, searchQuery, filterStatus, sortBy]);

  const handleToggleSelectAll = () => {
    toggleSelectAll(filteredAndSortedResumes.map((r) => r.id));
  };

  return (
    <m.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? REDUCED_MOTION_VARIANTS : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border border-border dark:border-border/80 dark:bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl">Resume Versions</CardTitle>
              {selectedResumes.size > 0 && (
                <Button variant="destructive" size="sm" onClick={bulkDelete} className="relative gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                  <span className="t-badge" data-open="true" aria-hidden="true">
                    <span className="t-badge-dot min-w-5 rounded-full bg-background px-1.5 py-0.5 text-center text-[10px] font-bold text-destructive shadow">
                      {selectedResumes.size}
                    </span>
                  </span>
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <ClearableInput
                type="text"
                placeholder="Search by filename or notes..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                wrapperClassName="relative flex-1 sm:min-w-[200px]"
                leadingIcon={
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                }
                className="w-full pl-9 pr-10 py-2 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                textClassName="pl-9 pr-10 py-2 text-sm"
              />
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as "all" | "active" | "inactive")
                  }
                  className="pl-9 pr-8 py-2 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                >
                  <option value="all">All Resumes</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="pl-9 pr-8 py-2 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="size-desc">Largest First</option>
                  <option value="size-asc">Smallest First</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator className="mx-6 w-auto" />

        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : resumes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No resumes uploaded yet. Upload your first resume below.
            </p>
          ) : filteredAndSortedResumes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No resumes match your search criteria.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <input
                  type="checkbox"
                  checked={
                    selectedResumes.size === filteredAndSortedResumes.length &&
                    filteredAndSortedResumes.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-input cursor-pointer accent-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Select all ({filteredAndSortedResumes.length})
                </span>
              </div>
              {filteredAndSortedResumes.map((resume, index) => (
                <m.div
                  key={resume.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={
                    prefersReducedMotion ? REDUCED_MOTION_VARIANTS : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border border-border dark:border-border/80 rounded-xl bg-card/30 hover:bg-accent/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedResumes.has(resume.id)}
                      onChange={() => toggleResumeSelection(resume.id)}
                      className="w-4 h-4 rounded border-input cursor-pointer accent-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{resume.filename}</p>
                        <Tooltip label="Rename resume">
                          <button
                            onClick={() => openRename(resume)}
                            className="shrink-0 p-1 hover:bg-accent rounded-lg transition-colors"
                            aria-label="Rename resume"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {new Date(resume.uploadedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(resume.fileSize)}</span>
                      </div>
                      {resume.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {resume.notes}
                        </p>
                      )}
                    </div>
                    {resume.isActive && (
                      <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 hover:bg-green-500/30">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {resume.isActive && (
                      <>
                        <Tooltip label="Copy resume link">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyResumeLink(resume)}
                            aria-label="Copy resume link"
                            className="hover:bg-accent"
                          >
                            {copiedResumeId === resume.id ? (
                              <SuccessCheck active className="text-green-500" />
                            ) : (
                              <Link2 className="w-4 h-4" />
                            )}
                          </Button>
                        </Tooltip>
                        <Tooltip label="View on website">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open("/", "_blank")}
                            aria-label="View on website"
                            className="hover:bg-accent"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip label="Edit notes">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditNotes(resume)}
                        aria-label="Edit notes"
                        className="hover:bg-accent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Preview resume">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewResume(resume)}
                        aria-label="Preview resume"
                        className="hover:bg-accent"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Download resume">
                      <a href={resume.path} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Download resume"
                          className="hover:bg-accent"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    </Tooltip>
                    {!resume.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActive(resume.id)}
                        className="gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Set Active
                      </Button>
                    )}
                    {!resume.isActive && (
                      <Tooltip label="Delete resume">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteResume(resume.id, resume.filename)}
                          aria-label="Delete resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </m.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </m.div>
  );
}
