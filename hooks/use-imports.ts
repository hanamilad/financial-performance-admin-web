"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveImport,
  deleteImport,
  getImport,
  listImports,
  publishImport,
  returnImportToDraft,
  submitImport,
  uploadImport,
  type ImportBatchDetail,
  type ImportListParams,
  type UploadImportPayload,
} from "@/lib/imports";

const importsKey = ["imports"] as const;

export function useImports(params: ImportListParams) {
  return useQuery({
    queryKey: [...importsKey, "list", params],
    queryFn: () => listImports(params),
    placeholderData: (previous) => previous,
  });
}

export function useImport(id: number) {
  return useQuery({
    queryKey: [...importsKey, "detail", id],
    queryFn: () => getImport(id),
  });
}

export function useUploadImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadImportPayload) => uploadImport(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...importsKey, "list"] }),
  });
}

export function useDeleteImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteImport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...importsKey, "list"] }),
  });
}

function useTransition(mutationFn: (id: number) => Promise<ImportBatchDetail>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (batch) => {
      queryClient.setQueryData([...importsKey, "detail", batch.id], batch);
      queryClient.invalidateQueries({ queryKey: [...importsKey, "list"] });
    },
  });
}

export function useSubmitImport() {
  return useTransition(submitImport);
}

export function useApproveImport() {
  return useTransition(approveImport);
}

export function usePublishImport() {
  return useTransition(publishImport);
}

export function useReturnImportToDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: number; reviewNote: string }) =>
      returnImportToDraft(id, reviewNote),
    onSuccess: (batch) => {
      queryClient.setQueryData([...importsKey, "detail", batch.id], batch);
      queryClient.invalidateQueries({ queryKey: [...importsKey, "list"] });
    },
  });
}
