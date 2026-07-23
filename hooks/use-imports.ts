"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteImport,
  getImport,
  listImports,
  uploadImport,
  type UploadImportPayload,
} from "@/lib/imports";

const importsKey = ["imports"] as const;

export function useImports(page: number) {
  return useQuery({
    queryKey: [...importsKey, "list", page],
    queryFn: () => listImports(page),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: importsKey }),
  });
}

export function useDeleteImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteImport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: importsKey }),
  });
}
