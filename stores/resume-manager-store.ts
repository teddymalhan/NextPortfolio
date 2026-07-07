/**
 * Resume Manager Store
 * Manages all state and actions for the ResumeManager component
 */

import { createStore } from './use-store'
import { toast } from 'sonner'
import { handleApiResponse } from '@/lib/api-client'
import type { ResumeResponse, VisibilityResponse } from '@/types/api'

interface ResumeVersion extends ResumeResponse {}

type FilterStatus = 'all' | 'active' | 'inactive'
type SortBy =
  | 'date-desc'
  | 'date-asc'
  | 'name-asc'
  | 'name-desc'
  | 'size-desc'
  | 'size-asc'

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

interface ResumeManagerState {
  // Resume data
  resumes: ResumeVersion[]
  isResumeVisible: boolean

  // UI state
  uploading: boolean
  loading: boolean
  previewResume: ResumeVersion | null
  editingNotes: ResumeVersion | null
  notesText: string
  renamingResume: ResumeVersion | null
  newFilename: string

  // Filter and sort
  searchQuery: string
  filterStatus: FilterStatus
  sortBy: SortBy

  // Selection
  selectedResumes: Set<number>

  // Visibility toggle state
  togglingVisibility: boolean
  cooldown: boolean

  // Upload options
  autoSetActive: boolean

  // Actions - Data fetching
  fetchResumes: () => Promise<void>
  fetchVisibility: () => Promise<void>

  // Actions - Resume operations
  handleUpload: (file: File) => Promise<void>
  setActive: (resumeId: number) => Promise<void>
  deleteResume: (resumeId: number, filename: string) => Promise<void>
  toggleVisibility: () => Promise<void>

  // Actions - Notes
  openEditNotes: (resume: ResumeVersion) => void
  closeEditNotes: () => void
  saveNotes: () => Promise<void>
  setNotesText: (text: string) => void

  // Actions - Rename
  openRename: (resume: ResumeVersion) => void
  closeRename: () => void
  saveRename: () => Promise<void>
  setNewFilename: (filename: string) => void

  // Actions - Selection
  toggleResumeSelection: (resumeId: number) => void
  toggleSelectAll: (allResumeIds: number[]) => void
  bulkDelete: () => Promise<void>

  // Actions - UI
  setPreviewResume: (resume: ResumeVersion | null) => void
  setSearchQuery: (query: string) => void
  setFilterStatus: (status: FilterStatus) => void
  setSortBy: (sort: SortBy) => void
  setAutoSetActive: (enabled: boolean) => void

  // Utility
  copyResumeLink: (resume: ResumeVersion) => Promise<void>
}

export const useResumeManagerStore = createStore<ResumeManagerState>(
  'ResumeManagerStore',
  (set, get) => ({
    // Initial state
    resumes: [],
    isResumeVisible: true,
    uploading: false,
    loading: true,
    previewResume: null,
    editingNotes: null,
    notesText: '',
    renamingResume: null,
    newFilename: '',
    searchQuery: '',
    filterStatus: 'all',
    sortBy: 'date-desc',
    selectedResumes: new Set<number>(),
    togglingVisibility: false,
    cooldown: false,
    autoSetActive: false,

    // Data fetching
    fetchResumes: async () => {
      try {
        set({ loading: true })
        const res = await fetch('/api/resume/versions')
        const data = await handleApiResponse<ResumeResponse[]>(res)
        console.log('Fetched resumes:', data)
        set({ resumes: data })
      } catch (error: unknown) {
        console.error('Failed to fetch resumes:', error)
        toast.error(getErrorMessage(error, 'Failed to load resumes'))
      } finally {
        set({ loading: false })
      }
    },

    fetchVisibility: async () => {
      try {
        const res = await fetch('/api/resume/visibility')
        const data = await handleApiResponse<VisibilityResponse>(res)
        set({ isResumeVisible: data.isVisible })
      } catch (error) {
        console.error('Failed to fetch visibility:', error)
        // Keep default state (visible) on error
      }
    },

    // Resume operations
    handleUpload: async (file: File) => {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      set({ uploading: true })
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/resume', {
          method: 'POST',
          body: formData,
        })

        const data = await handleApiResponse<{
          id: number
          filename: string
          blob_url: string
          uploadedAt: string
        }>(res)

        toast.success('Resume uploaded successfully')
        await get().fetchResumes()

        // Auto-set as active if option is enabled
        const { autoSetActive } = get()
        if (autoSetActive && data.id) {
          await get().setActive(data.id)
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to upload resume'))
      } finally {
        set({ uploading: false })
      }
    },

    setActive: async (resumeId: number) => {
      try {
        const res = await fetch('/api/resume/active', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId }),
        })

        await handleApiResponse(res)
        toast.success('Active resume updated')
        await get().fetchResumes()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to update active resume'))
      }
    },

    deleteResume: async (resumeId: number, filename: string) => {
      if (
        !confirm(
          `Are you sure you want to delete "${filename}"? This action cannot be undone.`,
        )
      )
        return

      try {
        const res = await fetch(`/api/resume/${resumeId}`, {
          method: 'DELETE',
        })

        await handleApiResponse(res)
        toast.success('Resume deleted')
        await get().fetchResumes()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to delete resume'))
      }
    },

    toggleVisibility: async () => {
      const { cooldown, isResumeVisible } = get()
      if (cooldown) return

      try {
        set({ cooldown: true, togglingVisibility: true })
        const newVisibility = !isResumeVisible
        const res = await fetch('/api/resume/visibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isVisible: newVisibility }),
        })

        const data = await handleApiResponse<VisibilityResponse>(res)
        set({ isResumeVisible: data.isVisible })
        toast.success(
          data.isVisible
            ? 'Resume is now visible on the website'
            : 'Resume is now hidden from the website',
        )
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to toggle visibility'))
      } finally {
        set({ togglingVisibility: false })
        setTimeout(() => set({ cooldown: false }), 2000)
      }
    },

    // Notes
    openEditNotes: (resume: ResumeVersion) => {
      set({ editingNotes: resume, notesText: resume.notes || '' })
    },

    closeEditNotes: () => {
      set({ editingNotes: null, notesText: '' })
    },

    saveNotes: async () => {
      const { editingNotes, notesText } = get()
      if (!editingNotes) return

      try {
        const res = await fetch(`/api/resume/${editingNotes.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: notesText.trim() || null }),
        })

        await handleApiResponse(res)
        toast.success('Notes updated')
        set({ editingNotes: null, notesText: '' })
        await get().fetchResumes()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to update notes'))
      }
    },

    setNotesText: (text: string) => set({ notesText: text }),

    // Rename
    openRename: (resume: ResumeVersion) => {
      set({ renamingResume: resume, newFilename: resume.filename })
    },

    closeRename: () => {
      set({ renamingResume: null, newFilename: '' })
    },

    saveRename: async () => {
      const { renamingResume, newFilename } = get()
      if (!renamingResume) return

      const trimmedFilename = newFilename.trim()
      if (!trimmedFilename) {
        toast.error('Filename cannot be empty')
        return
      }

      if (trimmedFilename === renamingResume.filename) {
        set({ renamingResume: null, newFilename: '' })
        return
      }

      try {
        const res = await fetch(`/api/resume/${renamingResume.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: trimmedFilename }),
        })

        await handleApiResponse(res)
        toast.success('Resume renamed')
        set({ renamingResume: null, newFilename: '' })
        await get().fetchResumes()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to rename resume'))
      }
    },

    setNewFilename: (filename: string) => set({ newFilename: filename }),

    // Selection
    toggleResumeSelection: (resumeId: number) => {
      const { selectedResumes } = get()
      const newSelected = new Set(selectedResumes)
      if (newSelected.has(resumeId)) {
        newSelected.delete(resumeId)
      } else {
        newSelected.add(resumeId)
      }
      set({ selectedResumes: newSelected })
    },

    toggleSelectAll: (allResumeIds: number[]) => {
      const { selectedResumes } = get()
      if (selectedResumes.size === allResumeIds.length) {
        set({ selectedResumes: new Set<number>() })
      } else {
        set({ selectedResumes: new Set(allResumeIds) })
      }
    },

    bulkDelete: async () => {
      const { selectedResumes, resumes } = get()
      if (selectedResumes.size === 0) {
        toast.error('No resumes selected')
        return
      }

      // Check if any selected resumes are active
      const selectedActiveResumes = resumes.filter(
        (r) => selectedResumes.has(r.id) && r.isActive,
      )

      if (selectedActiveResumes.length > 0) {
        toast.error(
          'Cannot delete active resume(s). Set another resume as active first.',
        )
        return
      }

      const count = selectedResumes.size
      if (
        !confirm(
          `Are you sure you want to delete ${count} resume${count > 1 ? 's' : ''}? This action cannot be undone.`,
        )
      ) {
        return
      }

      try {
        const deletePromises = Array.from(selectedResumes).map((id) =>
          fetch(`/api/resume/${id}`, { method: 'DELETE' }),
        )

        const results = await Promise.allSettled(deletePromises)
        const failed = results.filter((r) => r.status === 'rejected').length

        if (failed === 0) {
          toast.success(
            `Successfully deleted ${count} resume${count > 1 ? 's' : ''}`,
          )
        } else {
          toast.warning(`Deleted ${count - failed} of ${count} resumes`)
        }

        set({ selectedResumes: new Set<number>() })
        await get().fetchResumes()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to delete resumes'))
      }
    },

    // UI actions
    setPreviewResume: (resume: ResumeVersion | null) =>
      set({ previewResume: resume }),
    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setFilterStatus: (status: FilterStatus) => set({ filterStatus: status }),
    setSortBy: (sort: SortBy) => set({ sortBy: sort }),
    setAutoSetActive: (enabled: boolean) => set({ autoSetActive: enabled }),

    // Utility
    copyResumeLink: async (resume: ResumeVersion) => {
      const resumeUrl = `${window.location.origin}/api/resume/file?v=${resume.id}`
      try {
        await navigator.clipboard.writeText(resumeUrl)
        toast.success('Resume link copied to clipboard!')
      } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = resumeUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success('Resume link copied to clipboard!')
      }
    },
  }),
  {
    persist: false, // Don't persist - data is fetched from API
  }
)
