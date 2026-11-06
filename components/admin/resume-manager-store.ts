import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'
import { handleApiResponse } from '@/lib/api-client'
import { resumeUpdateSchema, validateFile } from '@/lib/validations/resume'
import type { ResumeResponse, ResumeDeleteResponse, VisibilityResponse } from '@/types/api'

type FilterStatus = 'all' | 'active' | 'inactive'
type SortBy = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc'
type ResumeDialog =
  | { kind: 'preview'; id: number }
  | { kind: 'notes'; id: number; draft: string }
  | { kind: 'rename'; id: number; draft: string }

type PendingCommand =
  | { kind: 'upload' | 'bulk-delete' }
  | { kind: 'activate' | 'delete' | 'notes' | 'rename'; id: number }

export type CommandResult<T = undefined> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'busy' | 'cancelled' }

export type UploadOutcome = {
  resume: ResumeResponse
  activation: { status: 'not-requested' } | CommandResult<ResumeResponse>
}

interface ResumeManagerState {
  resumes: ResumeResponse[]
  isResumeVisible: boolean
  loading: boolean
  pending: PendingCommand | null
  togglingVisibility: boolean
  dialog: ResumeDialog | null
  searchQuery: string
  filterStatus: FilterStatus
  sortBy: SortBy
  selectedResumes: Set<number>
  autoSetActive: boolean
  fetchResumes: () => Promise<CommandResult<ResumeResponse[]>>
  fetchVisibility: () => Promise<CommandResult<VisibilityResponse>>
  handleUpload: (file: File) => Promise<CommandResult<UploadOutcome>>
  setActive: (id: number) => Promise<CommandResult<ResumeResponse>>
  deleteResume: (id: number) => Promise<CommandResult<ResumeDeleteResponse>>
  toggleVisibility: () => Promise<CommandResult<VisibilityResponse>>
  openDialog: (kind: ResumeDialog['kind'], id: number) => void
  closeDialog: () => void
  setDialogDraft: (draft: string) => void
  saveDialog: () => Promise<CommandResult<ResumeResponse>>
  toggleResumeSelection: (id: number) => void
  toggleSelectAll: (visibleIds: number[]) => void
  bulkDelete: () => Promise<CommandResult<{ deletedIds: number[]; failedIds: number[]; warnings: string[] }>>
  setSearchQuery: (query: string) => void
  setFilterStatus: (status: FilterStatus) => void
  setSortBy: (sort: SortBy) => void
  setAutoSetActive: (enabled: boolean) => void
  copyResumeLink: (resume: ResumeResponse) => Promise<boolean>
}

function failure(error: unknown, fallback: string): { status: 'error'; error: string } {
  const message = error instanceof Error && error.message ? error.message : fallback
  toast.error(message)
  return { status: 'error', error: message }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  return handleApiResponse<T>(await fetch(url, init))
}

function activateResume(id: number): Promise<ResumeResponse> {
  return request('/api/resume/active', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId: id }),
  })
}

function deleteResumeRequest(id: number): Promise<ResumeDeleteResponse> {
  return request<ResumeDeleteResponse>(`/api/resume/${id}`, { method: 'DELETE' })
}

function reconcileSelection(resumes: ResumeResponse[], selected: Set<number>): Set<number> {
  return new Set(resumes.filter((resume) => !resume.isActive && selected.has(resume.id)).map((resume) => resume.id))
}

export const useResumeManagerStore = create<ResumeManagerState>()(devtools((set, get) => {
  function replaceRecords(resumes: ResumeResponse[]) {
    set((state) => ({
      resumes,
      selectedResumes: reconcileSelection(resumes, state.selectedResumes),
      dialog: state.dialog && resumes.some((resume) => resume.id === state.dialog?.id) ? state.dialog : null,
    }))
  }

  function applyRecord(record: ResumeResponse, activate = false) {
    const resumes = get().resumes
    const exists = resumes.some((resume) => resume.id === record.id)
    replaceRecords([
      ...(!exists ? [record] : []),
      ...resumes.map((resume) => resume.id === record.id ? record : activate ? { ...resume, isActive: false } : resume),
    ])
  }

  function removeRecords(ids: number[]) {
    const removed = new Set(ids)
    replaceRecords(get().resumes.filter((resume) => !removed.has(resume.id)))
  }

  return {
    resumes: [],
    isResumeVisible: true,
    loading: true,
    pending: null,
    togglingVisibility: false,
    dialog: null,
    searchQuery: '',
    filterStatus: 'all',
    sortBy: 'date-desc',
    selectedResumes: new Set<number>(),
    autoSetActive: false,

    fetchResumes: async () => {
      set({ loading: true })
      try {
        const resumes = await request<ResumeResponse[]>('/api/resume/versions')
        replaceRecords(resumes)
        return { status: 'success', data: resumes }
      } catch (error) {
        return failure(error, 'Failed to load resumes')
      } finally {
        set({ loading: false })
      }
    },

    fetchVisibility: async () => {
      try {
        const data = await request<VisibilityResponse>('/api/resume/visibility')
        set({ isResumeVisible: data.isVisible })
        if (data.warning) toast.warning(data.warning)
        return { status: 'success', data }
      } catch (error) {
        return failure(error, 'Failed to load resume visibility')
      }
    },

    handleUpload: async (file) => {
      if (get().pending) return { status: 'busy' }
      const validation = validateFile(file)
      if (!validation.valid) return failure(new Error(validation.error), 'Invalid resume file')
      const autoSetActive = get().autoSetActive
      set({ pending: { kind: 'upload' } })
      try {
        const formData = new FormData()
        formData.append('file', file)
        const resume = await request<ResumeResponse>('/api/resume', { method: 'POST', body: formData })
        applyRecord(resume)
        let activation: UploadOutcome['activation'] = { status: 'not-requested' }
        if (autoSetActive) {
          try {
            const active = await activateResume(resume.id)
            applyRecord(active, true)
            activation = { status: 'success', data: active }
            toast.success('Resume uploaded and set active')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to activate resume'
            activation = { status: 'error', error: message }
            toast.warning(`Resume uploaded, but activation failed: ${message}`)
          }
        } else {
          toast.success('Resume uploaded successfully')
        }
        return { status: 'success', data: { resume, activation } }
      } catch (error) {
        return failure(error, 'Failed to upload resume')
      } finally {
        set({ pending: null })
      }
    },

    setActive: async (id) => {
      if (get().pending) return { status: 'busy' }
      set({ pending: { kind: 'activate', id } })
      try {
        const resume = await activateResume(id)
        applyRecord(resume, true)
        toast.success('Active resume updated')
        return { status: 'success', data: resume }
      } catch (error) {
        return failure(error, 'Failed to update active resume')
      } finally {
        set({ pending: null })
      }
    },

    deleteResume: async (id) => {
      if (get().pending) return { status: 'busy' }
      const resume = get().resumes.find((record) => record.id === id)
      if (!resume || resume.isActive) return failure(new Error('Only inactive resumes can be deleted'), 'Cannot delete resume')
      if (!confirm(`Are you sure you want to delete "${resume.filename}"? This action cannot be undone.`)) return { status: 'cancelled' }
      set({ pending: { kind: 'delete', id } })
      try {
        const data = await deleteResumeRequest(id)
        removeRecords([id])
        if (data.warning) toast.warning(data.warning)
        else toast.success('Resume deleted')
        return { status: 'success', data }
      } catch (error) {
        return failure(error, 'Failed to delete resume')
      } finally {
        set({ pending: null })
      }
    },

    toggleVisibility: async () => {
      if (get().togglingVisibility) return { status: 'busy' }
      const isVisible = !get().isResumeVisible
      set({ togglingVisibility: true })
      try {
        const data = await request<VisibilityResponse>('/api/resume/visibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isVisible }),
        })
        set({ isResumeVisible: data.isVisible })
        toast.success(data.isVisible ? 'Resume is now visible on the website' : 'Resume is now hidden from the website')
        return { status: 'success', data }
      } catch (error) {
        return failure(error, 'Failed to toggle visibility')
      } finally {
        set({ togglingVisibility: false })
      }
    },

    openDialog: (kind, id) => {
      if (get().pending) return
      const resume = get().resumes.find((record) => record.id === id)
      if (!resume) return
      set({ dialog: kind === 'preview' ? { kind, id } : { kind, id, draft: kind === 'notes' ? resume.notes || '' : resume.filename } })
    },
    closeDialog: () => {
      if (get().pending?.kind === 'notes' || get().pending?.kind === 'rename') return
      set({ dialog: null })
    },
    setDialogDraft: (draft) => {
      const { dialog, pending } = get()
      if (dialog && dialog.kind !== 'preview' && !pending) set({ dialog: { ...dialog, draft } })
    },
    saveDialog: async () => {
      if (get().pending) return { status: 'busy' }
      const dialog = get().dialog
      if (!dialog || dialog.kind === 'preview') return { status: 'cancelled' }
      const current = get().resumes.find((resume) => resume.id === dialog.id)
      if (!current) return failure(new Error('Resume no longer exists'), 'Resume no longer exists')
      const draft = dialog.draft.trim()
      const update = resumeUpdateSchema.safeParse(dialog.kind === 'notes' ? { notes: draft || null } : { filename: draft })
      if (!update.success) return failure(new Error(update.error.issues[0]?.message || 'Invalid resume update'), 'Invalid resume update')
      if (dialog.kind === 'rename' && draft === current.filename) {
        set({ dialog: null })
        return { status: 'success', data: current }
      }
      set({ pending: { kind: dialog.kind, id: dialog.id } })
      try {
        const resume = await request<ResumeResponse>(`/api/resume/${dialog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data),
        })
        applyRecord(resume)
        set({ dialog: null })
        toast.success(dialog.kind === 'notes' ? 'Notes updated' : 'Resume renamed')
        return { status: 'success', data: resume }
      } catch (error) {
        return failure(error, dialog.kind === 'notes' ? 'Failed to update notes' : 'Failed to rename resume')
      } finally {
        set({ pending: null })
      }
    },

    toggleResumeSelection: (id) => {
      const { resumes, selectedResumes, pending } = get()
      if (pending || !resumes.some((resume) => resume.id === id && !resume.isActive)) return
      const selected = new Set(selectedResumes)
      if (selected.has(id)) selected.delete(id)
      else selected.add(id)
      set({ selectedResumes: selected })
    },
    toggleSelectAll: (visibleIds) => {
      const { resumes, selectedResumes, pending } = get()
      if (pending) return
      const visible = new Set(visibleIds)
      const eligible = resumes.filter((resume) => visible.has(resume.id) && !resume.isActive).map((resume) => resume.id)
      const allSelected = eligible.every((id) => selectedResumes.has(id))
      const selected = new Set(selectedResumes)
      for (const id of eligible) {
        if (allSelected) selected.delete(id)
        else selected.add(id)
      }
      set({ selectedResumes: selected })
    },
    bulkDelete: async () => {
      if (get().pending) return { status: 'busy' }
      const { resumes, selectedResumes } = get()
      const ids = resumes.filter((resume) => !resume.isActive && selectedResumes.has(resume.id)).map((resume) => resume.id)
      if (!ids.length) return failure(new Error('No inactive resumes selected'), 'No resumes selected')
      if (!confirm(`Are you sure you want to delete ${ids.length} resume${ids.length > 1 ? 's' : ''}? This action cannot be undone.`)) return { status: 'cancelled' }
      set({ pending: { kind: 'bulk-delete' } })
      try {
        const results = await Promise.allSettled(ids.map(deleteResumeRequest))
        const deletedIds = ids.filter((_, index) => results[index].status === 'fulfilled')
        const failedIds = ids.filter((_, index) => results[index].status === 'rejected')
        const warnings = results.flatMap((result) => result.status === 'fulfilled' && result.value.warning ? [result.value.warning] : [])
        removeRecords(deletedIds)
        if (failedIds.length) toast.warning(`Deleted ${deletedIds.length} of ${ids.length} resumes. ${failedIds.length} failed and remain selected.`)
        else if (!warnings.length) toast.success(`Successfully deleted ${deletedIds.length} resume${deletedIds.length > 1 ? 's' : ''}`)
        for (const warning of warnings) toast.warning(warning)
        return { status: 'success', data: { deletedIds, failedIds, warnings } }
      } finally {
        set({ pending: null })
      }
    },

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setFilterStatus: (filterStatus) => set({ filterStatus }),
    setSortBy: (sortBy) => set({ sortBy }),
    setAutoSetActive: (autoSetActive) => set({ autoSetActive }),
    copyResumeLink: async (resume) => {
      const url = `${window.location.origin}/api/resume/file?v=${resume.id}`
      let copied = false
      try {
        await navigator.clipboard.writeText(url)
        copied = true
      } catch {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        try {
          copied = document.execCommand('copy')
        } catch {
          copied = false
        } finally {
          textarea.remove()
        }
      }
      if (copied) toast.success('Resume link copied to clipboard!')
      else toast.error('Failed to copy resume link')
      return copied
    },
  }
}, { name: 'ResumeManagerStore' }))
