"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ImportBatchDetail, ImportRow } from "@/lib/imports";
import {
  addManualRow,
  createManualDraft,
  deleteManualRow,
  getManualEntry,
  getManualSchema,
  submitManual,
  updateManualRow,
  validateManual,
  type ManualRow,
} from "@/lib/manual-entry";

const entryKey = (id: number) => ["manual-entry", id] as const;

function toImportRow(row: ManualRow): ImportRow {
  return { id: row.id, sheet_name: row.sheet_name, row_number: row.row_number, data: row.data };
}

export function useManualSchema() {
  return useQuery({
    queryKey: ["manual-entry", "schema"],
    queryFn: getManualSchema,
    staleTime: Infinity,
  });
}

export function useManualEntry(id: number) {
  return useQuery({
    queryKey: entryKey(id),
    queryFn: () => getManualEntry(id),
    enabled: id > 0,
  });
}

export function useCreateManualDraft() {
  return useMutation({ mutationFn: createManualDraft });
}

export function useAddManualRow(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sheet, data }: { sheet: string; data: Record<string, unknown> }) => addManualRow(id, sheet, data),
    onSuccess: (row) => {
      queryClient.setQueryData<ImportBatchDetail>(entryKey(id), (previous) =>
        previous ? { ...previous, rows: [...previous.rows, toImportRow(row)] } : previous,
      );
    },
  });
}

export function useUpdateManualRow(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rowId, data }: { rowId: number; data: Record<string, unknown> }) => updateManualRow(id, rowId, data),
    onSuccess: (row) => {
      queryClient.setQueryData<ImportBatchDetail>(entryKey(id), (previous) =>
        previous
          ? { ...previous, rows: previous.rows.map((existing) => (existing.id === row.id ? toImportRow(row) : existing)) }
          : previous,
      );
    },
  });
}

export function useDeleteManualRow(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rowId: number) => deleteManualRow(id, rowId),
    onSuccess: (_result, rowId) => {
      queryClient.setQueryData<ImportBatchDetail>(entryKey(id), (previous) =>
        previous ? { ...previous, rows: previous.rows.filter((existing) => existing.id !== rowId) } : previous,
      );
    },
  });
}

export function useValidateManual(id: number) {
  return useMutation({ mutationFn: () => validateManual(id) });
}

export function useSubmitManual(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitManual(id),
    onSuccess: (batch) => {
      queryClient.setQueryData(entryKey(id), batch);
      queryClient.invalidateQueries({ queryKey: ["imports", "list"] });
    },
  });
}
