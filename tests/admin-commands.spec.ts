import { expect, test } from "@playwright/test";
import { useResumeManagerStore } from "../components/admin/resume-manager-store";
import type { ResumeResponse } from "../types/api";

const originalFetch = globalThis.fetch;
const originalConfirm = globalThis.confirm;

function resume(id: number, isActive = false): ResumeResponse {
  return {
    id,
    filename: `resume-${id}.pdf`,
    path: `https://example.test/${id}.pdf`,
    blob_url: `https://example.test/${id}.pdf`,
    isActive,
    uploadedAt: "2026-01-01T00:00:00.000Z",
  };
}

function success(data: unknown) {
  return Response.json({ success: true, data });
}

function failure(message: string) {
  return Response.json({ success: false, error: message }, { status: 500 });
}

test.beforeEach(() => {
  useResumeManagerStore.setState({
    ...useResumeManagerStore.getInitialState(),
    resumes: [resume(1), resume(2), resume(3, true)],
    selectedResumes: new Set<number>(),
    loading: false,
  }, true);
  globalThis.confirm = () => true;
});

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.confirm = originalConfirm;
});

test("select-all uses visible membership, preserves hidden selection and excludes the active resume", () => {
  const store = useResumeManagerStore;
  store.getState().toggleResumeSelection(1);
  store.getState().toggleSelectAll([2, 3]);
  expect([...store.getState().selectedResumes].sort()).toEqual([1, 2]);

  store.getState().toggleSelectAll([2, 3]);
  expect([...store.getState().selectedResumes]).toEqual([1]);
  store.getState().toggleResumeSelection(3);
  expect([...store.getState().selectedResumes]).toEqual([1]);
});

test("bulk deletion counts HTTP failures and retains only failed selections", async () => {
  globalThis.fetch = async (input) => String(input).endsWith("/1")
    ? success({ deleted: true, resume: resume(1) })
    : failure("Storage is unavailable");
  const store = useResumeManagerStore;
  store.getState().toggleSelectAll([1, 2]);
  const result = await store.getState().bulkDelete();

  expect(result).toEqual({
    status: "success",
    data: { deletedIds: [1], failedIds: [2], warnings: [] },
  });
  expect(store.getState().resumes.map((record) => record.id)).toEqual([2, 3]);
  expect([...store.getState().selectedResumes]).toEqual([2]);
  expect(store.getState().pending).toBeNull();
});

test("a committed deletion with a Blob warning does not leave a phantom record", async () => {
  const warning = "The record was deleted but Blob cleanup failed";
  globalThis.fetch = async () => success({ deleted: true, resume: resume(1), warning });
  const result = await useResumeManagerStore.getState().deleteResume(1);

  expect(result).toEqual({ status: "success", data: { deleted: true, resume: resume(1), warning } });
  expect(useResumeManagerStore.getState().resumes.map((record) => record.id)).toEqual([2, 3]);
});

test("failed auto-activation preserves the uploaded version and the prior active version", async () => {
  globalThis.fetch = async (_input, init) => init?.method === "POST"
    ? success(resume(4))
    : failure("Activation failed");
  const store = useResumeManagerStore;
  store.getState().setAutoSetActive(true);
  const result = await store.getState().handleUpload(new File(["%PDF-1.7"], "new.pdf", { type: "application/pdf" }));

  expect(result).toEqual({
    status: "success",
    data: { resume: resume(4), activation: { status: "error", error: "Activation failed" } },
  });
  expect(store.getState().resumes.filter((record) => record.isActive).map((record) => record.id)).toEqual([3]);
  expect(store.getState().resumes.find((record) => record.id === 4)?.isActive).toBe(false);
});

test("a failed save preserves its draft and excludes overlapping mutations", async () => {
  const { promise, resolve: finish } = Promise.withResolvers<Response>();
  globalThis.fetch = () => promise;
  const store = useResumeManagerStore;
  store.getState().openDialog("rename", 1);
  store.getState().setDialogDraft("renamed.pdf");
  const saving = store.getState().saveDialog();

  expect(await store.getState().setActive(2)).toEqual({ status: "busy" });
  store.getState().closeDialog();
  expect(store.getState().dialog).toEqual({ kind: "rename", id: 1, draft: "renamed.pdf" });
  finish(failure("Save failed"));
  expect(await saving).toEqual({ status: "error", error: "Save failed" });
  expect(store.getState().dialog).toEqual({ kind: "rename", id: 1, draft: "renamed.pdf" });
  expect(store.getState().resumes[0].filename).toBe("resume-1.pdf");
});

test("refresh reconciles deleted selections and closes a missing dialog target", async () => {
  const store = useResumeManagerStore;
  store.getState().toggleResumeSelection(1);
  store.getState().toggleResumeSelection(2);
  store.getState().openDialog("preview", 1);
  globalThis.fetch = async () => success([resume(2, true), resume(3)]);
  await store.getState().fetchResumes();

  expect([...store.getState().selectedResumes]).toEqual([]);
  expect(store.getState().dialog).toBeNull();
});
